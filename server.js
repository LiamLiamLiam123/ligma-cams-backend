// server.js
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all requests
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Serve static files (optional: index.html can be served here)
app.use(express.static(path.join(__dirname, ".")));

// Proxy NSW LiveTraffic JSON
app.get("/nsw-cameras.json", async (req, res) => {
  try {
    const response = await fetch("https://data.livetraffic.com/cameras/traffic-cam.json");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch NSW JSON" });
  }
});

// Proxy Victoria / Melbourne traffic cameras JSON
app.get("/vic-cameras.json", async (req, res) => {
  try {
    const response = await fetch("https://traffic.vicroads.vic.gov.au/feeds/camera_locations.json");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch VIC JSON" });
  }
});

// Proxy any camera image
app.get("/image", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("Missing URL");

    const response = await fetch(url);
    if (!response.ok) return res.status(500).send("Failed to fetch image");

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "image/jpeg");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching image");
  }
});

app.listen(PORT, () => console.log(`Ligma-cams backend running on port ${PORT}`));
