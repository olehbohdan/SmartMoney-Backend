import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Route for login/signup logic
router.post('/auth', async (req, res) => {
  try {
    const { name, email } = req.body;
    console.log('Received request body:', req.body);


    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // If user exists, return the user data for login
      return res.status(200).json({ message: 'User logged in successfully', user });
    } else {
      // If user does not exist, create a new user for signup
      user = new User({ name, email, userId: 'user_id' });
      await user.save();
      return res.status(201).json({ message: 'User created successfully', user });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//Separate route to create a new user directly
router.post('/add', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Create a new user instance
    const newUser = new User({
      userId,
      name,
      email,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



export default router;
