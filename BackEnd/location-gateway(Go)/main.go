package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strconv"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

// Config holds database configuration
type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	ServerPort string
}

// GeoLocation represents a user's geographical location
type GeoLocation struct {
	LocationID int64   `json:"id"`
	UserID     int64   `json:"userId"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
	Address    string  `json:"address"`
	CreatedAt  string  `json:"createdAt"`
	UpdatedAt  string  `json:"updatedAt"`
}

// ProviderLocation represents a provider's location
type ProviderLocation struct {
	ProviderID int64   `json:"providerId"`
	Name       string  `json:"name"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
	Address    string  `json:"address"`
	IsActive   bool    `json:"isActive"`
}

// NearbyProvider represents a provider with calculated distance
type NearbyProvider struct {
	ProviderID int64   `json:"providerId"`
	Name       string  `json:"name"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
	Address    string  `json:"address"`
	DistanceKM float64 `json:"distanceKm"`
}

// Response represents API response
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

var db *sql.DB

func main() {
	// Load configuration
	config := loadConfig()

	// Initialize database
	initDB(config)
	defer db.Close()

	// Setup router
	router := mux.NewRouter()

	// Location endpoints
	router.HandleFunc("/api/location", createLocation).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/location/{userId}", getLocation).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/location/{userId}", updateLocation).Methods("PUT", "OPTIONS")

	// Provider location endpoints
	router.HandleFunc("/api/provider-location", createProviderLocation).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/provider-location/{providerId}", getProviderLocation).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/provider-locations", getAllProviderLocations).Methods("GET", "OPTIONS")

	// Proximity search endpoint
	router.HandleFunc("/api/nearby-providers", getNearbyProviders).Methods("GET", "OPTIONS")

	// Distance calculation endpoint
	router.HandleFunc("/api/distance", calculateDistance).Methods("GET", "OPTIONS")

	// Health check
	router.HandleFunc("/health", healthCheck).Methods("GET")

	// CORS middleware
	router.Use(corsMiddleware)

	// Start server
	port := config.ServerPort
	log.Printf("🚀 Location Gateway Service starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

func loadConfig() Config {
	return Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "3306"),
		DBUser:     getEnv("DB_USER", "root"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "wastenot_location"),
		ServerPort: getEnv("SERVER_PORT", "8080"),
	}
}

func getEnv(key, defaultVal string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultVal
}

func initDB(config Config) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
		config.DBUser, config.DBPassword, config.DBHost, config.DBPort, config.DBName)

	var err error
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	log.Println("✅ Database connected successfully")
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	sendJSONResponse(w, http.StatusOK, Response{Success: true, Message: "Service is healthy"})
}

// ========== USER LOCATION HANDLERS ==========

func createLocation(w http.ResponseWriter, r *http.Request) {
	var location GeoLocation
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		sendJSONResponse(w, http.StatusBadRequest, Response{Success: false, Message: "Invalid request body"})
		return
	}

	query := `INSERT INTO user_locations (user_id, latitude, longitude, address) VALUES (?, ?, ?, ?)`
	result, err := db.Exec(query, location.UserID, location.Latitude, location.Longitude, location.Address)
	if err != nil {
		log.Println("Error creating location:", err)
		sendJSONResponse(w, http.StatusInternalServerError, Response{Success: false, Message: "Failed to create location"})
		return
	}

	id, _ := result.LastInsertId()
	location.LocationID = id

	sendJSONResponse(w, http.StatusCreated, Response{Success: true, Message: "Location created", Data: location})
}

func getLocation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]

	var location GeoLocation
	query := `SELECT id, user_id, latitude, longitude, address, created_at, updated_at 
			  FROM user_locations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1`

	err := db.QueryRow(query, userID).Scan(
		&location.LocationID, &location.UserID, &location.Latitude,
		&location.Longitude, &location.Address, &location.CreatedAt, &location.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		sendJSONResponse(w, http.StatusNotFound, Response{Success: false, Message: "Location not found"})
		return
	}

	if err != nil {
		log.Println("Error fetching location:", err)
		sendJSONResponse(w, http.StatusInternalServerError, Response{Success: false, Message: "Failed to fetch location"})
		return
	}

	sendJSONResponse(w, http.StatusOK, Response{Success: true, Data: location})
}

func updateLocation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]

	var location GeoLocation
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		sendJSONResponse(w, http.StatusBadRequest, Response{Success: false, Message: "Invalid request body"})
		return
	}

	query := `UPDATE user_locations SET latitude = ?, longitude = ?, address = ?, updated_at = NOW() 
			  WHERE user_id = ?`
	_, err := db.Exec(query, location.Latitude, location.Longitude, location.Address, userID)
	if err != nil {
		log.Println("Error updating location:", err)
		sendJSONResponse(w, http.StatusInternalServerError, Response{Success: false, Message: "Failed to update location"})
		return
	}

	sendJSONResponse(w, http.StatusOK, Response{Success: true, Message: "Location updated"})
}

// ========== PROVIDER LOCATION HANDLERS ==========

func createProviderLocation(w http.ResponseWriter, r *http.Request) {
	var location ProviderLocation
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		sendJSONResponse(w, http.StatusBadRequest, Response{Success: false, Message: "Invalid request body"})
		return
	}

	query := `INSERT INTO provider_locations (provider_id, name, latitude, longitude, address, is_active) 
			  VALUES (?, ?, ?, ?, ?, ?)`
	_, err := db.Exec(query, location.ProviderID, location.Name, location.Latitude, location.Longitude, location.Address, location.IsActive)
	if err != nil {
		log.Println("Error creating provider location:", err)
		sendJSONResponse(w, http.StatusInternalServerError, Response{Success: false, Message: "Failed to create provider location"})
		return
	}

	sendJSONResponse(w, http.StatusCreated, Response{Success: true, Message: "Provider location created", Data: location})
}

func getProviderLocation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	providerID := vars["providerId"]

	var location ProviderLocation
	query := `SELECT provider_id, name, latitude, longitude, address, is_active 
			  FROM provider_locations WHERE provider_id = ?`

	err := db.QueryRow(query, providerID).Scan(
		&location.ProviderID, &location.Name, &location.Latitude,
		&location.Longitude, &location.Address, &location.IsActive,
	)

	if err == sql.ErrNoRows {
		sendJSONResponse(w, http.StatusNotFound, Response{Success: false, Message: "Provider location not found"})
		return
	}

	if err != nil {
		log.Println("Error fetching provider location:", err)
		sendJSONResponse(w, http.StatusInternalServerError, Response{Success: false, Message: "Failed to fetch provider location"})
		return
	}

	sendJSONResponse(w, http.StatusOK, Response{Success: true, Data: location})
}

func getAllProviderLocations(w http.ResponseWriter, r *http.Request) {
	query := `SELECT provider_id, name, latitude, longitude, address, is_active 
			  FROM provider_locations WHERE is_active = true`

	rows, err := db.Query(query)
	if err != nil {
		log.Println("Error fetching provider locations:", err)
		sendJSONResponse(w, http.StatusInternalServerError, Response{Success: false, Message: "Failed to fetch provider locations"})
		return
	}
	defer rows.Close()

	locations := []ProviderLocation{}
	for rows.Next() {
		var location ProviderLocation
		if err := rows.Scan(&location.ProviderID, &location.Name, &location.Latitude,
			&location.Longitude, &location.Address, &location.IsActive); err != nil {
			log.Println("Error scanning provider location:", err)
			continue
		}
		locations = append(locations, location)
	}

	sendJSONResponse(w, http.StatusOK, Response{Success: true, Data: locations})
}

// ========== PROXIMITY SEARCH ==========

func getNearbyProviders(w http.ResponseWriter, r *http.Request) {
	lat := r.URL.Query().Get("latitude")
	lon := r.URL.Query().Get("longitude")
	radiusKm := r.URL.Query().Get("radius")

	if lat == "" || lon == "" {
		sendJSONResponse(w, http.StatusBadRequest, Response{Success: false, Message: "Latitude and longitude are required"})
		return
	}

	latitude, _ := strconv.ParseFloat(lat, 64)
	longitude, _ := strconv.ParseFloat(lon, 64)
	radius := 10.0 // default 10km
	if radiusKm != "" {
		radius, _ = strconv.ParseFloat(radiusKm, 64)
	}

	query := `SELECT provider_id, name, latitude, longitude, address 
			  FROM provider_locations WHERE is_active = true`

	rows, err := db.Query(query)
	if err != nil {
		log.Println("Error fetching providers:", err)
		sendJSONResponse(w, http.StatusInternalServerError, Response{Success: false, Message: "Failed to fetch providers"})
		return
	}
	defer rows.Close()

	nearbyProviders := []NearbyProvider{}
	for rows.Next() {
		var provider NearbyProvider
		if err := rows.Scan(&provider.ProviderID, &provider.Name, &provider.Latitude,
			&provider.Longitude, &provider.Address); err != nil {
			log.Println("Error scanning provider:", err)
			continue
		}

		// Calculate distance using Haversine formula
		distance := haversineDistance(latitude, longitude, provider.Latitude, provider.Longitude)
		if distance <= radius {
			provider.DistanceKM = distance
			nearbyProviders = append(nearbyProviders, provider)
		}
	}

	sendJSONResponse(w, http.StatusOK, Response{Success: true, Data: nearbyProviders})
}

func calculateDistance(w http.ResponseWriter, r *http.Request) {
	lat1 := r.URL.Query().Get("lat1")
	lon1 := r.URL.Query().Get("lon1")
	lat2 := r.URL.Query().Get("lat2")
	lon2 := r.URL.Query().Get("lon2")

	if lat1 == "" || lon1 == "" || lat2 == "" || lon2 == "" {
		sendJSONResponse(w, http.StatusBadRequest, Response{Success: false, Message: "All coordinates required"})
		return
	}

	latitude1, _ := strconv.ParseFloat(lat1, 64)
	longitude1, _ := strconv.ParseFloat(lon1, 64)
	latitude2, _ := strconv.ParseFloat(lat2, 64)
	longitude2, _ := strconv.ParseFloat(lon2, 64)

	distance := haversineDistance(latitude1, longitude1, latitude2, longitude2)

	sendJSONResponse(w, http.StatusOK, Response{
		Success: true,
		Data: map[string]float64{
			"distanceKm": distance,
		},
	})
}

// ========== UTILITY FUNCTIONS ==========

// haversineDistance calculates the distance between two points on Earth using Haversine formula
func haversineDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371 // Earth's radius in kilometers

	dLat := toRadians(lat2 - lat1)
	dLon := toRadians(lon2 - lon1)

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(toRadians(lat1))*math.Cos(toRadians(lat2))*
			math.Sin(dLon/2)*math.Sin(dLon/2)

	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return R * c
}

func toRadians(degrees float64) float64 {
	return degrees * math.Pi / 180
}

func sendJSONResponse(w http.ResponseWriter, statusCode int, response Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}
