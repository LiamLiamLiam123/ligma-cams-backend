// server.js
const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 3000;

// CORS for frontend
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Proxy NSW cameras
app.get("/nsw-cameras.json", async (req, res) => {
  try {
    const response = await fetch("https://data.livetraffic.com/cameras/traffic-cam.json");
    const data = await response.json();

    // Filter Shell Cove / Princes Hwy
    const cams = data.features.filter(c => {
      const loc = c.properties.location.toLowerCase();
      return loc.includes("shellharbour") || loc.includes("warilla") || loc.includes("princes hwy");
    });

    // Map to consistent format
    const formatted = cams.map(c => ({
      location: c.properties.location,
      url: c.properties.latest_jpg
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch NSW cameras" });
  }
});

// Proxy Victoria / Melbourne cameras
app.get("/vic-cameras.json", async (req, res) => {
  try {
    const response = await fetch("https://traffic.vicroads.vic.gov.au/feeds/camera_locations.json");
    const data = await response.json();

    // Map to consistent format
    const cams = data.cameras.map(c => ({
      location: c.name,
      url: c.image // adjust based on actual JSON
    }));

    res.json(cams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch VIC cameras" });
  }
});

// Proxy any image
app.get("/image", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("Missing URL");

    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", "image/jpeg");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch image");
  }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
