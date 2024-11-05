import express from 'express';  // Use import for Express
import { createLinkToken, exchangePublicToken, getTransactions, storeMetaData } from '../controllers/plaidController.js';  // Use named imports for controllers
import checkJwt from '../middleware/authMiddleware.js';  // Ensure user is authenticated

const plaidRouter = express.Router();

// Routes for Plaid integration
plaidRouter.post('/create_link_token', createLinkToken);
plaidRouter.post('/exchange_public_token', exchangePublicToken);
plaidRouter.post('/transactions', getTransactions);
plaidRouter.post('/store-metadata', storeMetaData);  // Add the route to store metadata

export default plaidRouter;  // Export the router using export default