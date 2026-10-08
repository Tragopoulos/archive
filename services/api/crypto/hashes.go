package crypto

import (
	"api/request"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"fmt"
)

/** HashDevice returns a deterministic SHA-256 hash of the device hardware fields
 * combined with the account's Firebase UID. The same physical device always
 * produces the same hash per account, so an absent hash means a new or unknown device. */
func HashDevice(d *request.Data) string {
	h := sha256.New()
	h.Write([]byte(d.JWTFirebaseUID))
	h.Write([]byte(d.DeviceType))
	h.Write([]byte(d.DeviceManufacturer))
	h.Write([]byte(d.DeviceBrand))
	h.Write([]byte(d.DeviceModelName))
	h.Write([]byte(d.DeviceIOSModelID))
	h.Write([]byte(fmt.Sprintf("%v", d.DeviceCPUArchitectures)))
	h.Write([]byte(fmt.Sprintf("%t", d.DeviceIsPhysical)))
	h.Write([]byte(fmt.Sprintf("%d", d.DeviceTotalMemory)))
	h.Write([]byte(fmt.Sprintf("%d", d.DeviceYearClass)))
	return hex.EncodeToString(h.Sum(nil))
}

/** CompareHashes performs a constant-time comparison of two device hashes
 * to prevent timing attacks during hash verification. */
func CompareHashes(a, b string) bool {
	return subtle.ConstantTimeCompare([]byte(a), []byte(b)) == 1
}
