package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"contacts-web-bff/internal/bff"
)

func main() {
	runtime, err := bff.StartRuntimeFromEnv()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("contacts-web BFF listening on %s\n", runtime.BaseURL)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	<-ctx.Done()
	if err := runtime.Shutdown(context.Background()); err != nil {
		log.Fatal(err)
	}
}
