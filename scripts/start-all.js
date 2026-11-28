/**
 * @file start-all.js
 * @description Unified runner to start the full CareerPilot platform:
 *  1. Standalone MongoDB instance (port 27017)
 *  2. Database Seeder (Auth + Profile test accounts)
 *  3. Auth Service (Node.js on port 5001)
 *  4. Profile Service (Node.js on port 5002)
 *  5. Agent Orchestrator (FastAPI/Uvicorn on port 8000)
 *  6. Frontend Client (Vite React on port 3000)
 * @author CareerPilot Platform Team
 */
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require(path.join(__dirname, '../services/auth-service/node_modules/mongodb-memory-server'));

const ROOT = path.join(__dirname, '..');
const children = [];

const pythonCmd = process.env.PYTHON_PATH ||
  (process.platform === 'win32' && fs.existsSync('C:\\Users\\arikc\\anaconda3\\python.exe')
    ? 'C:\\Users\\arikc\\anaconda3\\python.exe'
    : 'python');

function log(service, msg) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] [${service}] ${msg}`);
}

async function main() {
  console.log('================================================================');
  console.log('   CAREERPILOT: FULL STACK PLATFORM RUNNER                      ');
  console.log('================================================================\n');

  // 1. Start MongoDB
  log('MongoDB', 'Starting in-memory MongoDB daemon on port 27017...');
  let mongod;
  try {
    mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        ip: '127.0.0.1',
        dbName: 'careerpilot'
      }
    });
    log('MongoDB', `Database online at: ${mongod.getUri()}`);
  } catch (err) {
    log('MongoDB', `Notice: ${err.message}. Assuming MongoDB is running at port 27017.`);
  }

  // 2. Seed Databases
  log('Seed', 'Seeding Auth Service database with test accounts...');
  try {
    execSync('node src/scripts/seed.js', { cwd: path.join(ROOT, 'services/auth-service'), stdio: 'inherit' });
    log('Seed', 'Auth database seeded.');
  } catch (e) {
    log('Seed', `Auth seed note: ${e.message}`);
  }

  log('Seed', 'Seeding Profile Service database...');
  try {
    execSync('node src/scripts/seed.js', { cwd: path.join(ROOT, 'services/profile-service'), stdio: 'inherit' });
    log('Seed', 'Profile database seeded.');
  } catch (e) {
    log('Seed', `Profile seed note: ${e.message}`);
  }

  // Helper to spawn service
  function startService(name, cmd, args, cwd, customEnv = {}) {
    const isWin = process.platform === 'win32';
    log(name, `Starting ${cmd} ${args.join(' ')}...`);
    const child = spawn(cmd, args, {
      cwd,
      shell: isWin,
      stdio: ['inherit', 'pipe', 'pipe'],
      env: { ...process.env, ...customEnv }
    });
    children.push(child);

    child.stdout.on('data', (d) => {
      process.stdout.write(`[${name}] ${d}`);
    });
    child.stderr.on('data', (d) => {
      process.stderr.write(`[${name}] ${d}`);
    });
    child.on('close', (code) => {
      log(name, `Exited with code ${code}`);
    });
    return child;
  }

  // 3. Start Auth Service (5001)
  startService('AuthService', 'node', ['src/server.js'], path.join(ROOT, 'services/auth-service'), {
    PORT: '5001',
    MONGODB_URI: 'mongodb://127.0.0.1:27017/careerpilot'
  });

  // 4. Start Profile Service (5002)
  startService('ProfileService', 'node', ['src/server.js'], path.join(ROOT, 'services/profile-service'), {
    PORT: '5002',
    MONGODB_URI: 'mongodb://127.0.0.1:27017/careerpilot'
  });

  // 5. Start GitHub MCP Server (5005)
  startService(
    'GitHubMCP',
    pythonCmd,
    ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '5005'],
    path.join(ROOT, 'mcp-servers/github-mcp'),
    { PYTHONPATH: '.' }
  );

  // 6. Start Job Board MCP Server (5006)
  startService(
    'JobBoardMCP',
    pythonCmd,
    ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '5006'],
    path.join(ROOT, 'mcp-servers/job-board-mcp'),
    { PYTHONPATH: '.' }
  );

  // 7. Start Agent Orchestrator (8000)
  startService(
    'Orchestrator',
    pythonCmd,
    ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000'],
    path.join(ROOT, 'services/agent-orchestrator'),
    {
      PYTHONPATH: '.',
      PROFILE_SERVICE_URL: 'http://localhost:5002',
      INTERNAL_SERVICE_KEY: 'careerpilot_internal_agent_secret_key_2026'
    }
  );

  // 8. Start Frontend (3000)
  startService('Frontend', 'npm', ['run', 'dev'], path.join(ROOT, 'frontend'));

  log('System', 'All services active! Accessible at:');
  console.log('   - Frontend:           http://localhost:3000');
  console.log('   - Auth Service:       http://localhost:5001/health');
  console.log('   - Profile Service:    http://localhost:5002/health');
  console.log('   - Agent Orchestrator: http://localhost:8000/health');
  console.log('   - GitHub MCP:         http://localhost:5005/health');
  console.log('   - Job Board MCP:      http://localhost:5006/health');
  console.log('   - MongoDB:            mongodb://127.0.0.1:27017\n');

  const cleanup = async () => {
    log('System', 'Terminating all services...');
    for (const child of children) {
      try {
        child.kill();
      } catch (_) {}
    }
    if (mongod) {
      await mongod.stop();
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch((err) => {
  console.error('[System] Fatal runner failure:', err);
  process.exit(1);
});
