const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');

let mongodInstance = null;

async function connectDB() {
  const customUri = process.env.MONGODB_URI;

  if (customUri) {
    try {
      console.log(`[DB] Attempting connection to specified URI: ${customUri}`);
      await mongoose.connect(customUri, { serverSelectionTimeoutMS: 3000 });
      console.log('[DB] Connected successfully to custom MongoDB URI');
      return;
    } catch (err) {
      console.warn(`[DB] Could not connect to custom URI: ${err.message}. Falling back to embedded MongoMemoryServer.`);
    }
  }

  // Try standard local mongod first
  try {
    const localUri = 'mongodb://127.0.0.1:27017/smriti_setu';
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
    console.log('[DB] Connected to local standalone MongoDB at 127.0.0.1:27017');
    return;
  } catch (localErr) {
    // Spin up MongoMemoryServer
    console.log('[DB] Local standalone MongoDB not active. Initializing embedded MongoMemoryServer...');
  }

  try {
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'smriti_setu',
        port: 27018
      }
    });

    const uri = mongodInstance.getUri();
    await mongoose.connect(uri);
    console.log(`[DB] Embedded MongoMemoryServer connected successfully at: ${uri}`);
  } catch (embeddedErr) {
    console.error('[DB] Failed to start MongoMemoryServer:', embeddedErr);
    throw embeddedErr;
  }
}

async function closeDB() {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}

module.exports = { connectDB, closeDB };
