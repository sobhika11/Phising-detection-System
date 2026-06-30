const neo4j = require('neo4j-driver');
require('dotenv').config({ path: __dirname + '/.env' });
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

module.exports = {  driver, checkNeo4j };