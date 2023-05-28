import mongoose from "mongoose";
const connection = {}

async function dbConnection() {
    if (connection.isConnected) return

    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
    })
    .then(() => {
        console.log('Connection established with MongoDB');
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
      });
}

export default dbConnection;