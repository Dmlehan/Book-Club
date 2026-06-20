import dotenv from 'dotenv';
// Load environment variables before importing other modules that may use them
dotenv.config();

import mongoose from 'mongoose';
import app from './app';

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/book_club';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    
    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Graceful Shutdown
    const gracefulShutdown = () => {
      console.log('Received kill signal, shutting down gracefully...');
      server.close(() => {
        console.log('Closed remaining connections.');
        mongoose.connection.close()
          .then(() => {
            console.log('MongoDB connection closed.');
            process.exit(0);
          })
          .catch((err) => {
            console.error('Error closing MongoDB connection:', err);
            process.exit(1);
          });
      });

      // Force close if it takes too long (e.g. 10s)
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });

export default app;
