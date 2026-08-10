const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/sockets/socket.manager');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Initialize Cron Jobs
const { initCronJobs } = require('./src/cron/reports.cron');
initCronJobs();

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
