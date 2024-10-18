import express  from 'express';
import { signup } from '../controllers/authController.js';  // Ensure the .js extension

const router = express.Router();

// POST route for user signup
router.post('/signup', signup);  // Pass the signup function as the callback

router.post('/register', (req, res) => {
    res.send('User registration route');
  });

export default router;  // Use export default for ESM