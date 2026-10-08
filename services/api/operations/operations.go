package operations

import (
	"api/db"
	"api/request"
	"bytes"
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/oracle/nosql-go-sdk/nosqldb"
)

/** CreateAccount builds an account insert with its compensating delete */
func CreateAccount(data *request.Data, accountID, now string) db.TxOp {
	profileJSON, _ := json.Marshal(db.Profile{
		Name:     data.JWTName,
		Picture:  data.JWTPicture,
		IsActive: true,
	})
	authMethodsJSON, _ := json.Marshal([]db.AuthMethod{{
		Provider:    data.JWTSignInProvider,
		FirebaseUID: data.JWTFirebaseUID,
		Audience:    data.JWTAudience,
		Issuer:      data.JWTIssuer,
		Email:       data.JWTEmail,
		IsVerified:  data.JWTEmailVerified,
		CreatedAt:   now,
		UpdatedAt:   now,
	}})
	return db.TxOp{
		Statement: fmt.Sprintf(db.InsertAccount, accountID, now, now, string(profileJSON), string(authMethodsJSON)),
		Rollback:  fmt.Sprintf(db.DeleteAccountByID, accountID),
	}
}

/** CreateOrganization builds an organization insert with its compensating delete */
func CreateOrganization(accountID, organizationID, now string) db.TxOp {
	orgProfileJSON, _ := json.Marshal(db.OrganizationProfile{
		Name:        "default",
		Description: "",
		Logo:        "",
		IsActive:    true,
	})
	membersJSON, _ := json.Marshal([]db.OrganizationMember{{
		AccountID: accountID,
		Role:      request.RoleOwner,
		IsActive:  true,
		CreatedAt: now,
		UpdatedAt: now,
	}})
	return db.TxOp{
		Statement: fmt.Sprintf(db.InsertOrganization, organizationID, now, now, string(orgProfileJSON), string(membersJSON)),
		Rollback:  fmt.Sprintf(db.DeleteOrganizationByID, organizationID),
	}
}

/** CreateDevice builds a device insert with its compensating delete */
func CreateDevice(data *request.Data, accountID, deviceID, now string) db.TxOp {
	signatureJSON, _ := json.Marshal(db.DeviceSignature{
		AccountID:        accountID,
		DeviceType:       data.DeviceType,
		Manufacturer:     data.DeviceManufacturer,
		Brand:            data.DeviceBrand,
		ModelName:        data.DeviceModelName,
		IsPhysicalDevice: data.DeviceIsPhysical,
		CPUArchitectures: data.DeviceCPUArchitectures,
		IOSModelID:       data.DeviceIOSModelID,
		TotalMemory:      data.DeviceTotalMemory,
		DeviceYearClass:  data.DeviceYearClass,
	})
	settingsJSON, _ := json.Marshal(db.DeviceSettings{
		OSName:                    data.DeviceOSName,
		OSVersion:                 data.DeviceOSVersion,
		DeviceName:                data.DeviceName,
		OSBuildID:                 data.DeviceOSBuildID,
		AndroidDesignName:         data.DeviceAndroidDesignName,
		AndroidOSBuildFingerprint: data.DeviceAndroidOSBuildFingerprint,
		AndroidPlatformAPILevel:   data.DeviceAndroidPlatformAPILevel,
		AndroidProductName:        data.DeviceAndroidProductName,
		CalendarType:              data.CalendarType,
		FirstWeekday:              data.CalendarFirstWeekday,
		Uses24Hour:                data.CalendarUses24Hour,
		CurrencyCode:              data.LocaleCurrencyCode,
		CurrencySymbol:            data.LocaleCurrencySymbol,
		DecimalSeparator:          data.LocaleDecimalSeparator,
		DigitGroupingSeparator:    data.LocaleDigitGroupingSeparator,
		TemperatureUnit:           data.LocaleTemperatureUnit,
		TextDirection:             data.LocaleTextDirection,
		Timezone:                  data.CalendarTimezone,
		LanguageTag:               data.LocaleLanguageTag,
		RegionCode:                data.LocaleRegionCode,
		AcceptLanguage:            data.AcceptLanguage,
	})
	return db.TxOp{
		Statement: fmt.Sprintf(db.InsertDevice, deviceID, now, now, string(signatureJSON), string(settingsJSON)),
		Rollback:  fmt.Sprintf(db.DeleteDeviceByID, deviceID),
	}
}

/** SendOTPWithEmail generates an OTP, stores it as an MFA challenge, and sends the verification email.
 *  On failure, populates data with error status and returns ("", false).
 *  On success, returns the new challenge ID and true. */
func SendOTPWithEmail(data *request.Data, client *nosqldb.Client, mailerURL string, emailCfg db.MFAEmailConfig) (string, bool) {
	/** Create OTP */
	otp, _ := rand.Int(rand.Reader, big.NewInt(1_000_000))
	code := fmt.Sprintf("%06d", otp.Int64())

	/** Create MFA challenge */
	challengeID := uuid.New().String()
	now := db.NowUTC()
	expiresAt := time.Now().UTC().Add(10 * time.Minute).Format(time.RFC3339)

	challengeJSON, _ := json.Marshal(db.Challenge{
		FirebaseUID: data.JWTFirebaseUID,
		Code:        code,
		Attempts:    0,
		IsUsed:      false,
	})

	stmt := fmt.Sprintf(db.InsertMFAChallenge, challengeID, now, expiresAt, string(challengeJSON))
	if !db.CreateToTable(client, db.TxOp{Statement: stmt}) {
		data.Severity = request.ERROR
		data.HTTPStatus = http.StatusInternalServerError
		data.HTTPStatusText = http.StatusText(http.StatusInternalServerError)
		data.Message = "Failed to create verification challenge"
		return "", false
	}

	/** Build email components (inject OTP code into template placeholders) */
	components := make([]any, len(emailCfg.Components))
	for i, c := range emailCfg.Components {
		m := make(map[string]any, len(c))
		for k, v := range c {
			m[k] = v
		}
		if s, ok := m["text_before"].(string); ok {
			m["text_before"] = fmt.Sprintf(s, code)
		}
		components[i] = m
	}

	/** Send verification email via mailer service */
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	body, err := json.Marshal(map[string]any{
		"from":       emailCfg.From,
		"to":         data.JWTEmail,
		"subject":    emailCfg.Subject,
		"components": components,
	})
	if err != nil {
		data.Severity = request.ERROR
		data.HTTPStatus = http.StatusInternalServerError
		data.HTTPStatusText = http.StatusText(http.StatusInternalServerError)
		data.Message = "Failed to send verification email"
		return "", false
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, mailerURL+"/"+emailCfg.Template, bytes.NewReader(body))
	if err != nil {
		data.Severity = request.ERROR
		data.HTTPStatus = http.StatusInternalServerError
		data.HTTPStatusText = http.StatusText(http.StatusInternalServerError)
		data.Message = "Failed to send verification email"
		return "", false
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		data.Severity = request.ERROR
		data.HTTPStatus = http.StatusInternalServerError
		data.HTTPStatusText = http.StatusText(http.StatusInternalServerError)
		data.Message = "Failed to send verification email"
		return "", false
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusMultiStatus {
		data.Severity = request.ERROR
		data.HTTPStatus = http.StatusInternalServerError
		data.HTTPStatusText = http.StatusText(http.StatusInternalServerError)
		data.Message = "Failed to send verification email"
		return "", false
	}

	return challengeID, true
}

/** VerifyOTP validates challenge_id and mfa_code from the request body.
 *  Populates data with the appropriate error status on failure.
 *  Returns the challenge_id string and true on success. */
func VerifyOTP(data *request.Data, client *nosqldb.Client, maxAttempts int) (string, bool) {
	/** Validates challenge_id */
	challengeIDStr, ok := data.ReqBody["challenge_id"].(string)
	if !ok || challengeIDStr == "" {
		data.Severity = request.WARNING
		data.HTTPStatus = http.StatusBadRequest
		data.HTTPStatusText = http.StatusText(http.StatusBadRequest)
		data.Message = "Invalid challenge ID"
		return "", false
	}

	/** Validate UUID format */
	if _, err := uuid.Parse(challengeIDStr); err != nil {
		data.Severity = request.WARNING
		data.HTTPStatus = http.StatusBadRequest
		data.HTTPStatusText = http.StatusText(http.StatusBadRequest)
		data.Message = "Invalid challenge ID"
		return "", false
	}

	/** Validates mfa_code */
	mfaCode, ok := data.ReqBody["mfa_code"].(string)
	if !ok || mfaCode == "" {
		data.Severity = request.WARNING
		data.HTTPStatus = http.StatusBadRequest
		data.HTTPStatusText = http.StatusText(http.StatusBadRequest)
		data.Message = "mfa_code is required"
		return "", false
	}

	/** Gets the challenge from the DB */
	challenge, ok := db.ReadFromTable[db.MFAChallenge](client, db.SelectMFAChallengeByID, challengeIDStr)
	if !ok || challenge == nil {
		data.Severity = request.WARNING
		data.HTTPStatus = http.StatusUnauthorized
		data.HTTPStatusText = http.StatusText(http.StatusUnauthorized)
		data.Message = "Verification challenge not found or already used"
		return "", false
	}

	/** Security: challenge belongs to a different identity */
	if challenge.Challenge.FirebaseUID != data.JWTFirebaseUID {
		data.Severity = request.WARNING
		data.HTTPStatus = http.StatusUnauthorized
		data.HTTPStatusText = http.StatusText(http.StatusUnauthorized)
		data.Message = "Challenge does not belong to this identity"
		return "", false
	}

	/** Count this attempt */
	attemptStmt := fmt.Sprintf(db.UpdateMFAAttempts, challenge.Challenge.Attempts+1, challengeIDStr)
	db.UpdateToTable(client, attemptStmt)
	challenge.Challenge.Attempts++
	expiresAt, _ := db.ParseTimestamp(challenge.ExpiresAt)

	switch {
	case challenge.Challenge.Attempts > maxAttempts:
		data.Severity = request.WARNING
		data.HTTPStatus = http.StatusTooManyRequests
		data.HTTPStatusText = http.StatusText(http.StatusTooManyRequests)
		data.Message = "Too many verification attempts \u2014 please request a new code"
		return "", false
	case time.Now().UTC().After(expiresAt):
		data.Severity = request.WARNING
		data.HTTPStatus = http.StatusUnauthorized
		data.HTTPStatusText = http.StatusText(http.StatusUnauthorized)
		data.Message = "Verification code has expired \u2014 please request a new code"
		return "", false
	case mfaCode != challenge.Challenge.Code:
		data.Severity = request.WARNING
		data.HTTPStatus = http.StatusUnauthorized
		data.HTTPStatusText = http.StatusText(http.StatusUnauthorized)
		data.Message = "Invalid verification code"
		return "", false
	}

	return challengeIDStr, true
}

/** MarkChallengeUsed builds an MFA challenge used-update with its compensating rollback */
func MarkChallengeUsed(challengeID string) db.TxOp {
	return db.TxOp{
		Statement: fmt.Sprintf(db.UpdateMFAChallengeUsed, challengeID),
		Rollback:  fmt.Sprintf(db.UpdateMFAChallengeNotUsed, challengeID),
	}
}
