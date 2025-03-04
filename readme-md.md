# Weather API Backend

## Prerequisites
- Node.js (v14 or later)
- OpenWeatherMap API Key

## Setup Instructions
1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory
4. Add your OpenWeatherMap API key to the `.env` file
5. Start the server
   ```bash
   npm start
   ```

## API Endpoints
- `GET /api/weather?city=CityName`
  - Retrieves weather information for the specified city
  - Returns JSON with weather details

## Deployment Platforms
- Heroku
- Vercel
- Render
- DigitalOcean App Platform

## Environment Variables
- `WEATHER_API_KEY`: Your OpenWeatherMap API key
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode

## Error Handling
- Comprehensive error responses
- Logging for debugging
- Graceful error management
