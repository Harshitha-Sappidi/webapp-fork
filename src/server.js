const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 8080;

// Connecting to the database and starting the server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();
