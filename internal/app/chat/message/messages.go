package message

import (
	"fmt"
	"github.com/scirelli/ChittyChat/internal/app/chat/user"
)

//Control message that client sends back. The message the client sends back can have any one of these signal messages.
type Control struct {
	User    *user.User
	Content content       `json:"content"`
	Create  createMessage `json:"create"`
	Error   errorMessage  `json:"error"`
}

type content struct {
	Text string `json:"text"`
}

type errorMessage struct {
	Text string `json:"text"`
	Code string `json:"code"`
}

func (e *errorMessage) String() string {
	return fmt.Sprintf("Code: %s, Text: %s", e.Code, e.Text)
}

type createMessage struct {
	UserName string `json:"username"`
}
