package routes

import (
	"api/crypto"
	"api/db"
	"api/operations"
	"api/request"
	"api/response"
	"net/http"

	"github.com/oracle/nosql-go-sdk/nosqldb"
)

/** POST /account — Unified sign-in / sign-up endpoint */
func AccountCreate(client *nosqldb.Client, config *db.Config, w http.ResponseWriter, r *http.Request, data *request.Data) {
	/** Create device hash */
	data.DeviceID = crypto.HashDevice(data)

	/** Detect authentication flow */
	account, ok := db.ReadFromTable[db.Account](client, db.SelectAccountByProviderUID, data.JWTSignInProvider, data.JWTFirebaseUID)
	if !ok {
		data.HTTPStatus = http.StatusInternalServerError
		data.HTTPStatusText = http.StatusText(http.StatusInternalServerError)
		data.Severity = request.ERROR
		data.Message = "Failed to lookup authentication method"
	} else if account == nil {
		signUp(data, client, config)
	} else {
		signIn(data, client, config, account)
	}

	response.Send(w, data, config)
}

func signUp(data *request.Data, client *nosqldb.Client, config *db.Config) {
	var challengeID string

	/** Handle Password Provider */
	if data.JWTSignInProvider == request.ProviderPassword {
		challengeIDStr, _ := data.ReqBody["challenge_id"].(string)

		/** Phase 1: generate OTP and send verification email */
		if challengeIDStr == "" {
			newChallengeID, ok := operations.SendOTPWithEmail(data, client, config.MailerURL, config.MFAEmail)
			if !ok {
				return
			}
			data.HTTPStatus = http.StatusAccepted
			data.HTTPStatusText = http.StatusText(http.StatusAccepted)
			data.Severity = request.INFO
			data.Message = "Verification code sent"
			data.ResBody = map[string]any{
				"challenge_id": newChallengeID,
			}
			return
		}

		/** Phase 2: verify the OTP */
		var ok bool
		challengeID, ok = operations.VerifyOTP(data, client, config.MFAEmail.MaxAttempts)
		if !ok {
			return
		}
		data.JWTEmailVerified = true
	}

	/** Phase 3: Create account via executing sign-up transaction */
	ops := operations.SignUpTx(data, challengeID)
	if err := db.ExecuteTx(client, config, ops); err != nil {
		data.Message = err.Error()
		data.Severity = request.CRITICAL
		data.HTTPStatus = http.StatusInternalServerError
		data.HTTPStatusText = http.StatusText(http.StatusInternalServerError)
		return
	}

	data.HTTPStatus = http.StatusCreated
	data.HTTPStatusText = http.StatusText(http.StatusCreated)
	data.Severity = request.INFO
	data.Message = "Signed up successfully"
}

func signIn(data *request.Data, client *nosqldb.Client, config *db.Config, account *db.Account) {
	/** Populate for logging */
	data.AccountID = account.AccountID

	if !account.Profile.IsActive {
		data.HTTPStatus = http.StatusForbidden
		data.HTTPStatusText = http.StatusText(http.StatusForbidden)
		data.Severity = request.WARNING
		data.Message = "the account is deactivated"
		return
	}

	/** Check if device is known */
	device, _ := db.ReadFromTable[db.Device](client, db.SelectDeviceByID, data.DeviceID)
	isKnownDevice := device != nil

	if !isKnownDevice {
		challengeIDStr, _ := data.ReqBody["challenge_id"].(string)

		/** Phase 1: new device — send OTP */
		if challengeIDStr == "" {
			newChallengeID, ok := operations.SendOTPWithEmail(data, client, config.MailerURL, config.MFADeviceEmail)
			if !ok {
				return
			}
			data.HTTPStatus = http.StatusAccepted
			data.HTTPStatusText = http.StatusText(http.StatusAccepted)
			data.Severity = request.WARNING
			data.Message = "New device detected — verification required"
			data.ResBody = map[string]any{
				"challenge_id": newChallengeID,
			}
			return
		}

		/** Phase 2: verify OTP and register device */
		challengeID, ok := operations.VerifyOTP(data, client, config.MFADeviceEmail.MaxAttempts)
		if !ok {
			return
		}

		/** Phase 3: Registering the new device by executing the transaction built */
		ops := operations.AddDeviceTx(data, challengeID)
		if err := db.ExecuteTx(client, config, ops); err != nil {
			data.Severity = request.ERROR
			data.HTTPStatus = http.StatusInternalServerError
			data.HTTPStatusText = http.StatusText(http.StatusInternalServerError)
			data.Message = "Failed to register device"
			return
		}
	}

	data.HTTPStatus = http.StatusOK
	data.HTTPStatusText = http.StatusText(http.StatusOK)
	data.Severity = request.INFO
	data.Message = "Signed in successfully"
}
