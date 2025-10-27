// package main

// import (
// 	"encoding/json"
// 	"net/http"
// 	"strconv"
// )

// // LocationHandler wraps the repository to handle HTTP requests.
// type LocationHandler struct {
// 	Repo *LocationRepository
// }

// // NewLocationHandler is a constructor to initialize the handler with its dependencies.
// func NewLocationHandler(repo *LocationRepository) *LocationHandler {
// 	return &LocationHandler{Repo: repo}
// }

// // HandleGetNearbyItems is the method that serves the GET request.
// // Endpoint: GET /api/v1/locations/nearby-items
// func (h *LocationHandler) HandleGetNearbyItems(w http.ResponseWriter, r *http.Request) {
// 	// 1. Input Parsing and Validation (Go's fast I/O)
// 	latStr := r.URL.Query().Get("latitude")
// 	lonStr := r.URL.Query().Get("longitude")
// 	distStr := r.URL.Query().Get("distance_km")

// 	// Error handling and conversion
// 	latitude, err := strconv.ParseFloat(latStr, 64)
// 	longitude, err := strconv.ParseFloat(lonStr, 64)
// 	distance, err := strconv.ParseFloat(distStr, 64)

// 	if err != nil || latitude == 0 || longitude == 0 || distance == 0 {
// 		http.Error(w, "Invalid latitude, longitude, or distance_km provided.", http.StatusBadRequest)
// 		return
// 	}

// 	// 2. Business Logic Execution
// 	results, err := h.Repo.GetNearbyItems(latitude, longitude, distance)

// 	if err != nil {
// 		// Log the error internally
// 		http.Error(w, "Failed to execute proximity search.", http.StatusInternalServerError)
// 		return
// 	}

// 	// 3. Response Generation (JSON encoding)
// 	w.Header().Set("Content-Type", "application/json")
// 	w.WriteHeader(http.StatusOK)
// 	// Use Go's standard library for fast JSON marshalling
// 	json.NewEncoder(w).Encode(results) 
// }

// // --- Main function structure for setting up the router ---
// func main() {
// 	// Initialize the Repository (mocking DB connection for the example)
// 	mockDB := &sql.DB{} // Replace with actual connection
// 	repo := &LocationRepository{DB: mockDB}
	
// 	// Initialize the Handler
// 	handler := NewLocationHandler(repo)

// 	// Use Go's built-in Mux (router) or a simple framework like Gin/Echo
// 	http.HandleFunc("/api/v1/locations/nearby-items", handler.HandleGetNearbyItems)

// 	// Start the server (on a different port than the Java service)
// 	log.Fatal(http.ListenAndServe(":8081", nil))
// }