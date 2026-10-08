package db

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/oracle/oci-go-sdk/v65/common/auth"
	"github.com/oracle/oci-go-sdk/v65/objectstorage"
)

/** CreateObjectStorage returns an Object Storage client using Instance Principal auth */
func CreateObjectStorage() (*objectstorage.ObjectStorageClient, error) {
	provider, err := auth.InstancePrincipalConfigurationProvider()
	if err != nil {
		return nil, fmt.Errorf("instance principal auth failed: %w", err)
	}

	client, err := objectstorage.NewObjectStorageClientWithConfigurationProvider(provider)
	if err != nil {
		return nil, fmt.Errorf("object storage client failed: %w", err)
	}

	return &client, nil
}

/** UploadPendingEmails uploads all files in /home/opc/emails/ to Object Storage and deletes successfully uploaded ones */
func UploadPendingEmails(client *objectstorage.ObjectStorageClient, config *Config) error {
	emailsDir := config.EmailDirectory
	entries, err := os.ReadDir(emailsDir)
	if err != nil {
		return fmt.Errorf("failed to read emails dir: %w", err)
	}

	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		localPath := filepath.Join(emailsDir, e.Name())
		fileData, err := os.ReadFile(localPath)
		if err != nil {
			continue
		}
		objectName := e.Name()
		contentLen := int64(len(fileData))

		_, err = client.PutObject(context.Background(), objectstorage.PutObjectRequest{
			NamespaceName: &config.ObjectStorageNamespace,
			BucketName:    &config.ObjectStorageBucket,
			ObjectName:    &objectName,
			ContentLength: &contentLen,
			PutObjectBody: io.NopCloser(bytes.NewReader(fileData)),
		})
		if err != nil {
			return fmt.Errorf("upload failed for %s: %w", objectName, err)
		}
		os.Remove(localPath)
	}

	return nil
}
