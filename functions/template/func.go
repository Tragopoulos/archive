package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"

	"github.com/fnproject/fdk-go"
)

func main() {
	fdk.Handle(fdk.HandlerFunc(fnHandler))
}

type Person struct {
	Name string `json:"name"`
}

func fnHandler(ctx context.Context, in io.Reader, out io.Writer) {
	p := &Person{Name: "World"}
	json.NewDecoder(in).Decode(p)
	msg := struct {
		Msg string `json:"message"`
	}{
		Msg: fmt.Sprintf("Hello %s", p.Name),
	}
	json.NewEncoder(out).Encode(&msg)
}
