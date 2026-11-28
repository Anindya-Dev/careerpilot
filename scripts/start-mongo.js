/**
 * @file start-mongo.js
 * @description Local standalone MongoDB daemon using mongodb-memory-server.
 * Listens on port 27017 to provide MongoDB database capabilities
 * for AuthService and ProfileService without requiring Docker.
 */
const path = require('path');
const { MongoMemoryServer } = require(path.join(__dirname, '../services/auth-service/node_modules/mongodb-memory-server'));

async function run() {
  console.log('[MongoDaemon] Initializing MongoDB on port 27017...');
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      ip: '127.0.0.1',
      dbName: 'careerpilot'
    }
  });

  console.log(`[MongoDaemon] MongoDB successfully running at: ${mongod.getUri()}`);
  console.log('[MongoDaemon] Ready for connections from AuthService (5001) & ProfileService (5002)');

  const shutdown = async () => {
    console.log('[MongoDaemon] Stopping MongoDB...');
    await mongod.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

run().catch((err) => {
  console.error('[MongoDaemon] Failed to start MongoDB server:', err);
  process.exit(1);
});
