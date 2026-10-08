package db

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/oracle/oci-go-sdk/v65/common"
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

/** Uploads all files in the configured log directory to Object Storage and deletes successfully uploaded ones */
func UploadPendingLogs(client *objectstorage.ObjectStorageClient, config *Config) error {
	entries, err := os.ReadDir(config.LogDirectory)
	if err != nil {
		return fmt.Errorf("failed to read logs dir: %w", err)
	}

	for _, e := range entries {
		if e.IsDir() {
			continue
		}

		localPath := filepath.Join(config.LogDirectory, e.Name())
		fileData, err := os.ReadFile(localPath)
		if err != nil {
			fmt.Printf("Upload worker: skipped unreadable file %s\n", localPath)
			continue
		}

		objectName := e.Name()
		contentLen := int64(len(fileData))

		/** Apply a 15-second timeout per file so a hung connection doesn't freeze the worker */
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)

		// Fix: Pass 'ctx' here instead of context.Background()
		_, err = client.PutObject(ctx, objectstorage.PutObjectRequest{
			NamespaceName: &config.ObjectStorageNamespace,
			BucketName:    &config.ObjectStorageBucket,
			ObjectName:    &objectName,
			ContentLength: &contentLen,
			ContentType:   common.String("application/json"),
			PutObjectBody: io.NopCloser(bytes.NewReader(fileData)),
		})

		if err != nil {
			fmt.Printf("Upload worker: failed to upload %s: %v\n", objectName, err)
			cancel()
			continue
		}

		os.Remove(localPath)
		cancel()
	}

	return nil
}

/** Uploads a raw byte slice directly from memory to Object Storage. */
func UploadBytesToObjectStorage(ctx context.Context, client *objectstorage.ObjectStorageClient, config *Config, data []byte, objectName string) error {
	contentLen := int64(len(data))

	_, err := client.PutObject(ctx, objectstorage.PutObjectRequest{
		NamespaceName: &config.ObjectStorageNamespace,
		BucketName:    &config.ObjectStorageBucket,
		ObjectName:    &objectName,
		ContentLength: &contentLen,
		PutObjectBody: io.NopCloser(bytes.NewReader(data)),
	})

	if err != nil {
		return fmt.Errorf("direct memory upload failed for %s: %w", objectName, err)
	}

	return nil
}
