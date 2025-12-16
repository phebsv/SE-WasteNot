# Google Maps Integration Setup Guide

## ✅ Completed

The map view has been fully updated with Google Maps functionality:

1. **HTML Structure** - Updated with:
   - Google Maps API script tag (currently uses demo key)
   - Dynamic map container (`<div id="map">`)
   - Provider info sidebar with details and actions
   - Location display with coordinates
   - Radius slider (1-50 km range)
   - Control buttons (Recenter, Contact Provider, View Directions)

2. **JavaScript Functionality** - Complete with:
   - Browser geolocation detection (user location)
   - Blue marker for user position
   - Green numbered markers for providers
   - Radius-based filtering (1-50 km)
   - Provider info panel on marker click
   - Directions integration (opens Google Maps)
   - Backend API integration (location service on port 8080)
   - Fallback location: Manila (14.5995°N, 120.9842°E)

3. **CSS Styling** - All components styled:
   - Google Maps container
   - Provider info sidebar with animations
   - Radius slider with custom thumb styling
   - Location info display
   - Control buttons with hover effects
   - Responsive design

## ⚠️ Required: Google Maps API Key Setup

### Why It's Needed
The map currently uses a placeholder API key (`AIzaSyDemoKey`) which won't work. You need a real API key from Google Cloud Console.

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account (create one if needed)
3. Click **"Select a Project"** → **"New Project"**
4. Enter project name: `WasteNot` (or any name)
5. Click **"Create"**

### Step 2: Enable Required APIs
1. In the Google Cloud Console, search for **"Maps JavaScript API"**
2. Click on it → Click **"Enable"**
3. Repeat for these APIs (search and enable each):
   - **Directions API** (for turn-by-turn navigation)
   - **Geocoding API** (optional, for address to coordinates)
   - **Places API** (optional, for location search)

### Step 3: Create API Key
1. Go to **Credentials** (left sidebar)
2. Click **"+ Create Credentials"** → **"API Key"**
3. Copy the generated key (looks like: `AIzaSy...`)
4. Click **"Edit API Key"** to configure:
   - Under **"Application restrictions"** select **"HTTP referrers (web sites)"**
   - Add these referrers:
     ```
     http://localhost:5000/*
     http://localhost:5000
     127.0.0.1:5000
     ```
   - Under **"API restrictions"** check:
     - Maps JavaScript API
     - Directions API
   - Click **"Save"**

### Step 4: Add Key to Your Application
1. Open [consumer-mapview.html](consumer-mapview.html#L9)
2. Find this line:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDemoKey&libraries=places"></script>
   ```
3. Replace `AIzaSyDemoKey` with your actual API key:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_KEY_HERE&libraries=places"></script>
   ```
4. Save the file

## ✨ Features Now Available

Once API key is configured, you'll have:

### User Location
- Browser asks for permission to access your location
- Blue marker shows your current position
- Automatically centered on map
- Falls back to Manila if location denied

### Provider Discovery
- Green numbered markers show nearby food providers
- Click any marker to see provider details:
  - Name and distance from you
  - Address and contact info
  - Rating and operating hours
  - "View Directions" button → opens Google Maps navigation
  - "Contact Provider" button → messaging (ready to integrate)

### Radius Filtering
- Slider at bottom left: 1-50 km range
- Adjusts which providers are shown
- Recenter button brings map back to your location
- Real-time updates as you change radius

### Backend Integration
- Connects to Go location service (port 8080)
- Fetches providers based on:
  - Your current location
  - Selected radius
  - Updates dynamically

## 🔧 Testing Checklist

After adding your API key:

- [ ] Map displays without errors in console
- [ ] Browser asks for location permission
- [ ] Blue marker appears at your location
- [ ] Green markers show for nearby providers
- [ ] Click a marker → provider info appears on right
- [ ] Change radius slider → markers update
- [ ] Click "Recenter" → map pans to your location
- [ ] Click "View Directions" → Google Maps opens
- [ ] No CORS errors in browser console
- [ ] Map works on mobile (if needed)

## 🐛 Troubleshooting

### "Geolocation not supported"
- Make sure you're on `localhost:5000` or using HTTPS
- Check browser console for errors

### "Map not displaying"
- Check API key is correctly entered
- Verify Maps JavaScript API is enabled in Google Cloud
- Look for errors in browser Developer Tools (F12)

### "Providers not showing"
- Verify Go location service is running on port 8080
- Check Network tab in DevTools for API responses
- Ensure your location is being detected

### "Cannot read property 'LatLng' of undefined"
- Google Maps script didn't load
- Check API key validity
- Verify script tag loads before JavaScript code

## 📝 Current Service Ports

For reference, all your backend services:
- **PHP Auth**: `http://localhost/` (port 80 - XAMPP)
- **Go Location**: `http://localhost:8080/api/nearby-providers`
- **Java Marketplace**: `http://localhost:8081/api/products`
- **Frontend**: `http://localhost:5000/`

## 🔐 Security Note

The API key is exposed in the HTML source. This is fine for development with localhost restrictions. For production:
- Use backend proxy to call Google Maps API
- Implement server-side API key protection
- Remove localhost restrictions from API key
