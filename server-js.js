require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check route
app.get('/', (req, res) => {
    res.json({
        message: "Weather API is running",
        status: "healthy"
    });
});

// Weather API route
app.get("/api/weather", async (req, res) => {
    const { city } = req.query;
    const API_KEY = process.env.WEATHER_API_KEY;

    if (!city) {
        return res.status(400).json({ error: "City parameter is required" });
    }

    if (!API_KEY) {
        return res.status(500).json({ error: "Weather service configuration error" });
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const response = await axios.get(url);

        res.json({
            city: response.data.name,
            country: response.data.sys.country,
            temperature: response.data.main.temp,
            feelsLike: response.data.main.feels_like,
            description: response.data.weather[0].description,
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind.speed,
            icon: response.data.weather[0].icon
        });
    } catch (error) {
        console.error("Weather API Error:", error.response?.data || error.message);

        if (error.response) {
            switch (error.response.status) {
                case 404:
                    return res.status(404).json({ error: `City "${city}" not found` });
                case 401:
                    return res.status(401).json({ error: "Invalid API credentials" });
                case 429:
                    return res.status(429).json({ error: "API request limit exceeded" });
                default:
                    return res.status(500).json({ error: "Unable to fetch weather data" });
            }
        }

        res.status(500).json({ error: "Network error occurred" });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Unexpected server error" });
});

// Store server instance
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');

    server.close(() => {  // ✅ Fixed: Using `server.close()`
        console.log('HTTP server closed');
        process.exit(0);
    });
});

module.exports = app; // For testing
