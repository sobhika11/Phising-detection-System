const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');
require('dotenv').config({ path: __dirname + '/.env' });

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ Mongo Connection Error:", err);
  }
};

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const checkNeo4j = async () => {
  try {
    await driver.verifyConnectivity();
    console.log("✅ Neo4j Connected");
  } catch (err) {
    console.error("❌ Neo4j Connection Error:", err);
  }
};

module.exports = { connectMongo, driver, checkNeo4j };