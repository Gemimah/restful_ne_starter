import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

async function start() {
  try {
    await connectDatabase();

    const server = app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
      console.log(`Swagger docs: http://localhost:${env.port}/api-docs`);
    });

    const shutdown = async () => {
      console.log('Shutting down...');
      server.close();
      await disconnectDatabase();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
