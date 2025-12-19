// server.js
const express = require("express");
const fetch = require("node-fetch");
const nswData = require("./nsw-cameras.json"); // cached NSW cameras
const app = express();
const PORT = process.env.PORT || 3000;

// CORS for frontend
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Serve cached NSW cameras
app.get("/nsw-cameras.json", (req, res) => {
  res.json(nswData);
});

// Proxy Victoria / Melbourne cameras (live)
app.get("/vic-cameras.json", async (req, res) => {
  try {
    const response = await fetch("https://traffic.vicroads.vic.gov.au/feeds/camera_locations.json");
    const data = await response.json();
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
