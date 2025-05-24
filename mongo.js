const { MongoClient } = require('mongodb');

//const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB URI
const uri = 'mongodb+srv://shivani18905:shivani12345@cluster0.vaezoqg.mongodb.net/genai_medical?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

async function connect() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('your_database_name'); // Replace with your database name
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = { connect };