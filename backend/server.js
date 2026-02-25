const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
const apiRoutes = require("./routes/api");
const { initRocketWS } = require("./rocketGame");

app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);

// Статика React
app.use(express.static(path.join(__dirname, "../build")));

const server = http.createServer(app);

initRocketWS(server);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ВАЖНО: правильный catch-all для Express 5+
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});