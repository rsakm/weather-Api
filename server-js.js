require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Logging middleware
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

    // Input validation
    if (!city) {
        return res.status(400).json({ 
            error: "City parameter is required" 
        });
    }

    // API key validation
    if (!API_KEY) {
        return res.status(500).json({ 
            error: "Weather service configuration error" 
        });
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        
        const response = await axios.get(url);
        
        // Extract relevant weather information
        const weatherData = {
            city: response.data.name,
            country: response.data.sys.country,
            temperature: response.data.main.temp,
            feelsLike: response.data.main.feels_like,
            description: response.data.weather[0].description,
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind.speed,
            icon: response.data.weather[0].icon
        };

        res.json(weatherData);
    } catch (error) {
        console.error("Weather API Error:", error.response?.data || error.message);

        if (error.response) {
            switch (error.response.status) {
                case 404:
                    return res.status(404).json({ 
                        error: `City "${city}" not found` 
                    });
                case 401:
                    return res.status(401).json({ 
                        error: "Invalid API credentials" 
                    });
                case 429:
                    return res.status(429).json({ 
                        error: "API request limit exceeded" 
                    });
                default:
                    return res.status(500).json({ 
                        error: "Unable to fetch weather data" 
                    });
            }
        }

        // Network or other errors
        res.status(500).json({ 
            error: "Network error occurred" 
        });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: "Unexpected server error" 
    });
});

// Start server
const startServer = () => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
};

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    app.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

startServer();

module.exports = app; // For potential testing
