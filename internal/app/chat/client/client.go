package client

import "github.com/scirelli/ChittyChat/internal/pkg/websocket"

//Client represents a client connection
type Client interface {
	Connection() *websocket.Connection
}
