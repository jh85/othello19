package main

import (
	"log"
	"net/http"
)

func main() {
	fs := http.FileServer(http.Dir("www"));
	err := http.ListenAndServe(":80", fs);
	if err != nil {
		log.Println("ListenAndServe failed err =", err);
		return;
	}
}
