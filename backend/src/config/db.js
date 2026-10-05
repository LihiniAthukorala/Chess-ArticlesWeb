const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  const uri = mongoUri || (await MongoMemoryServer.create()).getUri();

  await mongoose.connect(uri, {
    dbName: 'chess-chronicle'
  });

  console.log(`MongoDB connected: ${uri}`);
  return uri;
}

module.exports = { connectDB };
