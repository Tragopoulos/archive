# Stage 1: Build Stage
FROM golang:1.25.3-alpine3.22 AS build-stage

# Install necessary build dependencies
RUN apk add --no-cache build-base

# Set up working directory
WORKDIR /go/src/func/

# Copy all source files to the working directory
ADD . .

# Enable Go modules
ENV GO111MODULE=on

# Clean up any existing vendor directory (if present)
RUN rm -rf vendor

# Ensure dependencies are up-to-date, tidy the go.mod file, and vendor dependencies
RUN go mod tidy && go mod vendor

# Build the Go application
RUN go build -ldflags="-s -w" -o func

# Stage 2: Final Image
FROM alpine:3.22

# Install necessary runtime dependencies
RUN apk add --no-cache ca-certificates

# Create user and group with IDs
RUN addgroup -g 1000 fn && adduser -u 1000 -G fn -D fn

# Set up working directory
WORKDIR /function

# Copy the built binary from the build stage to the final image
COPY --from=build-stage /go/src/func/func /function/

# Change ownership of the working directory
RUN chown -R fn:fn /function

# Switch to the fn user
USER fn

# Set the entrypoint to the built binary
ENTRYPOINT ["./func"]