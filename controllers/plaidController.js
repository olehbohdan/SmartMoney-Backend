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
    const clientUserId = req.body.user_id;
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
export const syncTransactions = async (req, res) => {
  try {
    console.log('Received metadata:', req.body);
    const userId = req.body.id;

    console.log('User ID:', userId);

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Iterate over all items for the user
    for (const item of user.items) {
      if (!item.plaidAccessToken) {
        console.warn(`Item missing plaidAccessToken, skipping...`);
        continue;
      }

      console.log(`Syncing transactions for item with accessToken: ${item.plaidAccessToken}`);

      // Call Plaid's transactionsSync for the current item's access token
      const transactionsResponse = await plaidClient.transactionsSync({
        access_token: item.plaidAccessToken,
      });

      console.log('Transactions:', transactionsResponse.data);

      // Update balances and ensure no duplicates
      for (const account of transactionsResponse.data.accounts) {
        const targetAccount = item.accounts.find(acc => acc.id === account.account_id);
        if (targetAccount) {
          targetAccount.balances = {
            available: account.balances.available,
            current: account.balances.current,
            limit: account.balances.limit,
            isoCurrencyCode: account.balances.iso_currency_code,
          };
        }
      }

      // Add new transactions while avoiding duplicates
      for (const transaction of transactionsResponse.data.added) {
        const targetAccount = item.accounts.find(acc => acc.id === transaction.account_id);
        if (targetAccount) {
          if (!targetAccount.transactions) {
            targetAccount.transactions = [];
          }

          // Check for duplicate transactions by `transaction_id`
          const existingTransaction = targetAccount.transactions.find(
            existing => existing.transaction_id === transaction.transaction_id
          );

          if (!existingTransaction) {
            targetAccount.transactions.push({
              account_id: transaction.account_id,
              account_owner: transaction.account_owner,
              amount: transaction.amount,
              authorized_date: transaction.authorized_date,
              category: transaction.category,
              category_id: transaction.category_id,
              check_number: transaction.check_number,
              counterparties: transaction.counterparties?.map(counterparty => ({
                name: counterparty.name,
                type: counterparty.type,
                logo_url: counterparty.logo_url,
                entity_id: counterparty.entity_id,
                website: counterparty.website,
                confidence_level: counterparty.confidence_level,
              })) || [],
              date: transaction.date,
              location: transaction.location ? {
                address: transaction.location.address,
                city: transaction.location.city,
                region: transaction.location.region,
                postal_code: transaction.location.postal_code,
                country: transaction.location.country,
                lat: transaction.location.lat,
                lon: transaction.location.lon,
                store_number: transaction.location.store_number,
              } : null,
              logo_url: transaction.logo_url,
              merchant_entity_id: transaction.merchant_entity_id,
              merchant_name: transaction.merchant_name,
              name: transaction.name,
              payment_channel: transaction.payment_channel,
              payment_meta: transaction.payment_meta ? {
                by_order_of: transaction.payment_meta.by_order_of,
                payee: transaction.payment_meta.payee,
                payer: transaction.payment_meta.payer,
                payment_method: transaction.payment_meta.payment_method,
                payment_processor: transaction.payment_meta.payment_processor,
                ppd_id: transaction.payment_meta.ppd_id,
                reason: transaction.payment_meta.reason,
                reference_number: transaction.payment_meta.reference_number,
              } : null,
              pending: transaction.pending,
              pending_transaction_id: transaction.pending_transaction_id,
              personal_finance_category: transaction.personal_finance_category || null,
              personal_finance_category_icon_url: transaction.personal_finance_category_icon_url,
              transaction_code: transaction.transaction_code,
              transaction_type: transaction.transaction_type,
              transaction_id: transaction.transaction_id,
              unofficial_currency_code: transaction.unofficial_currency_code,
              website: transaction.website,
            });
          }
        }
      }

      // Handle modified transactions
      for (const modifiedTransaction of transactionsResponse.data.modified) {
        const { account_id, transaction_id } = modifiedTransaction;
        const targetAccount = item.accounts.find(acc => acc.id === account_id);
        if (targetAccount) {
          const transactionIndex = targetAccount.transactions.findIndex(
            tx => tx.transaction_id === transaction_id
          );

          if (transactionIndex !== -1) {
            // Update the transaction details
            targetAccount.transactions[transactionIndex] = {
              ...targetAccount.transactions[transactionIndex],
              ...modifiedTransaction, // Overwrite with modified data
            };
          }
        }
      }

      // Handle removed transactions
      for (const removedTransaction of transactionsResponse.data.removed) {
        const { account_id, transaction_id } = removedTransaction;
        const targetAccount = item.accounts.find(acc => acc.id === account_id);
        if (targetAccount) {
          // Remove the transaction by filtering out the matching transaction_id
          targetAccount.transactions = targetAccount.transactions.filter(
            tx => tx.transaction_id !== transaction_id
          );
        }
      }

      // Update the item-specific properties
      item.transactionsNextCursor = transactionsResponse.data.next_cursor;
      item.transactionsHasMore = transactionsResponse.data.has_more;
      item.transactionsUpdateStatus = transactionsResponse.data.transactions_update_status;
    }

    // Save the updated user document
    await user.save();
    res.send('Transactions synced successfully for all items');
  } catch (error) {
    console.error('Error handling transactions:', error);
    res.status(500).send('Failed to handle transactions');
  }
};
