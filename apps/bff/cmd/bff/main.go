package main

import (
	"context"
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

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	<-ctx.Done()
	if err := runtime.Shutdown(context.Background()); err != nil {
		log.Fatal(err)
	}
}
