// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Import routes
const homeRoutes = require("./routes/homeRoutes");
const serviceFusionRoutes = require("./routes/serviceFusionRoutes");

// Middleware
app.use(express.json());

// Route handlers
app.use("/", homeRoutes); // Handles "/", "/about", etc.
app.use("/sf", serviceFusionRoutes); // Handles "/sf/jobs", etc.

// Start the server
app.listen(port, () => {
  console.log(`✅ PremierExpress server listening on port ${port}`);
});
