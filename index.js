import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';  // Ensure the .js extension
// import expenseRoutes from './routes/expenseRoutes.js';  // Uncomment and update when needed
import plaidRoutes from './routes/plaidRoutes.js';  // Ensure the .js extension
import userRoutes from './routes/userRoutes.js';  
import cors from 'cors';

// Initialize dotenv to load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize the Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // Middleware to parse URL-encoded data
app.use(cors());

// Define routes (remove the `.` at the start of the paths)
// app.use('/api', expenseRoutes);  // Uncomment when needed
app.use('/plaid', plaidRoutes);  // Plaid integration routes
app.use('/user', userRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});