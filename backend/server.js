const path = require("path");
const express = require('express');
const http = require('http');
const cors = require('cors');
const app = express();
const apiRoutes = require('./routes/api');
const { initRocketWS } = require('./rocketGame');

app.use(express.static(path.join(__dirname, "../build")));

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// fallback для React SPA (Express 5 способ)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

const server = http.createServer(app);

initRocketWS(server);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});