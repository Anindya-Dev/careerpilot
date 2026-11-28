/**
 * @file server.js
 * @description HTTP server entry point. Establishes MongoDB connectivity before binding to the network port.
 * Handles graceful shutdown on SIGINT/SIGTERM.
 * @author Md Hussain Ansari (Member 1)
 */

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const { PORT } = require('./config/env');

async function startServer() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[AuthService] Listening on port ${PORT} (http://localhost:${PORT})`);
      console.log(`[AuthService] Health check available at http://localhost:${PORT}/health`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[AuthService] Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[AuthService] HTTP server and database connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[AuthService] Fatal startup failure:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = startServer;
