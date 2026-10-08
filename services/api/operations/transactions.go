package operations

import (
	"api/db"
	"api/request"

	"github.com/google/uuid"
)

/** SignUpTx builds the compensating transaction operations for account creation */
func SignUpTx(data *request.Data, challengeID string) []db.TxOp {
	now := db.NowUTC()
	data.AccountID = uuid.New().String()
	data.OrganizationID = uuid.New().String()

	ops := []db.TxOp{
		CreateAccount(data, data.AccountID, now),
		CreateOrganization(data.AccountID, data.OrganizationID, now),
		CreateDevice(data, data.AccountID, data.DeviceID, now),
	}
	if challengeID != "" {
		ops = append([]db.TxOp{MarkChallengeUsed(challengeID)}, ops...)
	}
	return ops
}

/** AddDeviceTx builds the compensating transaction operations for registering a new device */
func AddDeviceTx(data *request.Data, challengeID string) []db.TxOp {
	now := db.NowUTC()
	return []db.TxOp{
		MarkChallengeUsed(challengeID),
		CreateDevice(data, data.AccountID, data.DeviceID, now),
	}
}
