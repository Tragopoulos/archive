package db

/** Query statement templates for NoSQL operations */
const (
	/** Account Queries */
	SelectAccountByProviderUID = `SELECT * FROM accounts a WHERE a.auth_methods[].provider = "%s" AND a.auth_methods[].firebase_uid = "%s"`
	SelectAccountByID          = `SELECT * FROM accounts WHERE account_id = "%s"`
	InsertAccount              = `INSERT INTO accounts VALUES ("%s", "%s", "%s", %s, %s)`
	DeleteAccountByID          = `DELETE FROM accounts WHERE account_id = "%s"`

	/** Device Queries */
	SelectDeviceByID = `SELECT * FROM devices WHERE device_id = "%s"`
	InsertDevice     = `INSERT INTO devices VALUES ("%s", "%s", "%s", %s, %s)`
	DeleteDeviceByID = `DELETE FROM devices WHERE device_id = "%s"`

	/** Organization Queries */
	InsertOrganization     = `INSERT INTO organizations VALUES ("%s", "%s", "%s", %s, %s)`
	DeleteOrganizationByID = `DELETE FROM organizations WHERE organization_id = "%s"`

	/** MFA Challenge Queries */
	SelectMFAChallengeByID    = `SELECT * FROM mfa_challenges WHERE challenge_id = "%s" AND c.challenge.is_used = false`
	InsertMFAChallenge        = `INSERT INTO mfa_challenges VALUES ("%s", "%s", "%s", %s)`
	UpdateMFAAttempts         = `UPDATE mfa_challenges SET challenge.attempts = %d WHERE challenge_id = "%s"`
	UpdateMFAChallengeUsed    = `UPDATE mfa_challenges SET challenge.is_used = true WHERE challenge_id = "%s"`
	UpdateMFAChallengeNotUsed = `UPDATE mfa_challenges SET challenge.is_used = false WHERE challenge_id = "%s"`
)
