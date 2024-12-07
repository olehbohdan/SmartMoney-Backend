import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

export const createUser = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Received request body:', req.body);
    
    
        // Check if user already exists
        let user = await User.findOne({ email });
        
        if (user) {
          // If user exists, return the user data for login
          return res.status(200).json({ message: 'User logged in successfully', user });
        } else {
          // If user does not exist, create a new user for signup
          user = new User({ email, userId: generateUserId() });
          await user.save();
          return res.status(201).json({ message: 'User created successfully', user });
        }
      } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
} 

export const addUser = async (req, res) => {
    try {
        const { email } = req.body;
    
        // Create a new user instance
        const newUser = new User({
          userId,
          email,
        });
    
        // Save the user to the database
        await newUser.save();
    
        res.status(201).json({ message: 'User added successfully', user: newUser });
      } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
}

export const getUserInfo = async (req, res) => {
  try {
    const userId = req.body.id;

    // Find the user by userId and populate the items with their accounts and balances
    const user = await User.findOne({ userId }).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Structure the response to include necessary details
    const userInfo = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      items: user.items.map(item => ({
        institution: item.institution, // institution name and ID
        accounts: item.accounts.map(account => ({
          id: account.id,
          name: account.name,
          type: account.type,
          subtype: account.subtype,
          balances: account.balances.map(balance => ({
            available: balance.available,
            current: balance.current,
            currency: balance.iso_currency_code || balance.unofficial_currency_code,
          })),
        })),
      })),
    };
    //console.log('User info:', userInfo.items[0].accounts[10]);
    res.status(200).json(userInfo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const generateUserId = () => {
    return uuidv4();
};

export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.body.id;

    // Find the user by userId and populate the transactions
    const user = await User.findOne({ userId }).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Structure the response to include necessary transaction details
    const transactions = user.items.flatMap(item =>
      item.accounts.flatMap(account =>
        account.transactions.map(transaction => ({
          accountId: account.id,
          date: transaction.date,
          amount: transaction.amount,
          currency: transaction.iso_currency_code || transaction.unofficial_currency_code,
          merchant: transaction.merchant_name,
          category: transaction.category,
          pending: transaction.pending,
        }))
      )
    );
    console.log('User transactions:', transactions);
    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};