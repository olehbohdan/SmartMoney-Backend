import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';  // Import Plaid modules

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
    const linkTokenResponse = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: req.user.id,
      },
      client_name: 'SmartMoney',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
    });
    res.json(linkTokenResponse.data);  // Plaid's response is nested in the `data` property
  } catch (err) {
    res.status(500).json({ error: 'Unable to create link token' });
  }
};

// Exchange Public Token for Access Token
export const exchangePublicToken = async (req, res) => {
  const { public_token } = req.body;

  try {
    const tokenResponse = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = tokenResponse.data.access_token;  // Access the token from the `data` property
    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ error: 'Unable to exchange public token' });
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