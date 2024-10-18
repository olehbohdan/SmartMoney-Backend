import express from 'express';  // Use import for Express
import { createLinkToken, exchangePublicToken, getTransactions } from '../controllers/plaidController.js';  // Use named imports for controllers
import checkJwt from '../middleware/authMiddleware.js';  // Ensure user is authenticated

const plaidRouter = express.Router();

// Routes for Plaid integration
plaidRouter.post('/create_link_token', checkJwt, createLinkToken);
plaidRouter.post('/exchange_public_token', checkJwt, exchangePublicToken);
plaidRouter.post('/transactions', checkJwt, getTransactions);

export default plaidRouter;  // Export the router using export default