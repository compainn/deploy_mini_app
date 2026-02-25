const express = require('express');
const http = require('http');
const cors = require('cors');
const app = express();
const apiRoutes = require('./routes/api');
const { initRocketWS } = require('./rocketGame');

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// Создаём HTTP-сервер вручную (нужно для WebSocket)
const server = http.createServer(app);

// Подключаем WebSocket ракеты
initRocketWS(server);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Бекенд запущен на http://localhost:${PORT}`);
});