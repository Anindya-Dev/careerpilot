/**
 * @file server.js
 * @description HTTP server entry point for Profile Microservice.
 * @author Md Hussain Ansari (Member 1)
 */

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const { PORT } = require('./config/env');

async function startServer() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[ProfileService] Listening on port ${PORT} (http://localhost:${PORT})`);
      console.log(`[ProfileService] Health check available at http://localhost:${PORT}/health`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[ProfileService] Received ${signal}. Shutting down...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[ProfileService] Closed gracefully.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[ProfileService] Fatal startup failure:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = startServer;
