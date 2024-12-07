import express from 'express';
import { addUser, createUser, getUserInfo, getUserTransactions } from '../controllers/userController.js';

const router = express.Router();

// Route for login/signup logic
router.post('/auth', createUser);

//Separate route to create a new user directly
router.post('/add', addUser);

router.post('/userinfo', getUserInfo);
router.post('/transactions', getUserTransactions);



export default router;
