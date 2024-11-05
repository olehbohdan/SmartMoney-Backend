import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';  // Import Plaid modules
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Plaid client configuration
const plaidClient = new PlaidApi(new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
}));

// Create Plaid Link Token
export const createLinkToken = async (req, res) => {
  try {
    const clientUserId = req.body.id;
    if (!clientUserId) {
      throw new Error('Client user ID is missing');
    }

    console.log(`Creating link token for client_user_id: ${clientUserId}`);
    
    const linkTokenResponse = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: clientUserId,
      },
      client_name: 'SmartMoney',
      products: [ 'transactions'],
      country_codes: ['US'],
      language: 'en',
    });

    console.log('Link token created successfully:', linkTokenResponse.data);
    res.json(linkTokenResponse.data.link_token);
  } catch (err) {
    console.error('Error creating link token:', err);
    res.status(500).json({ error: 'Unable to create link token', details: err.message });
  }
};

// Exchange Public Token for Access Token
export const exchangePublicToken = async (req, res) => {
  const { public_token } = req.body;

  try {
    console.log('Public token:', public_token);
    const tokenResponse = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = tokenResponse.data.access_token;  // Access the token from the `data` property
    const userId = req.body.id;
    const linkSessionId = req.body.linkSessionId;
    console.log('User ID:', userId);
    saveAccessToken(userId, accessToken, linkSessionId);
    res.json({ message: 'Access token exchanged successfully' });
    console.log('Access token:', accessToken);
    
  } catch (err) {
    res.status(500).json({ error: 'Unable to exchange public token' });
  }
};

const saveAccessToken = async (userId, accessToken, linkSessionId) => {
  try {
    let user = await User.findOne({ userId });
    if (!user) {
      throw new Error('User not found');
    }
    // Search for the item by linkSessionId
    let item = user.items.find(item => item.linkSessionId === linkSessionId);
    if (!item) {
      throw new Error('Item with the specified linkSessionId not found');
    }
    item.plaidAccessToken = accessToken;
    await user.save();
    console.log('Access token saved successfully');
  } catch (err) {
    console.error('Error saving access token:', err);
    throw err;
  }
};

// Fetch Transactions
export const getTransactions = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: '2023-01-01',
      end_date: '2023-12-31',
    });
    res.json(transactionsResponse.data.transactions);  // Access the transactions from `data.transactions`
  } catch (err) {
    res.status(500).json({ error: 'Unable to fetch transactions' });
  }
};

export const storeMetaData = async (req, res) => {
  try {
      const userId = req.body.id;  // Ensure userId is sent in the request body
      const data = req.body.success;      // The rest of the data should be nested under "data"
      console.log('User ID:', userId);
      console.log('Data:', data);
      // Validate that the user exists
      const user = await User.findOne({userId});
      if (!user) {
          return res.status(404).send('User not found');
      }

      user.items.push({
        accounts: data.metadata.accounts.map(account => ({
          id: account.id,
          mask: account.mask,
          name: account.name,
          subtype: account.subtype,
          type: account.type
        })),
        institution: {
          id: data.metadata.institution.id,
          name: data.metadata.institution.name
        },
        linkSessionId: data.metadata.linkSessionId,
      });

      await user.save();

      res.status(200).send('Metadata stored successfully');
  } catch (error) {
      console.error('Error storing metadata:', error);
      res.status(500).send('Failed to store metadata');
  }
};