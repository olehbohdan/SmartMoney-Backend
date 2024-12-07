import mongoose from 'mongoose';
import { transactionSchema } from './Transaction.js';
import { balanceSchema } from './Balance.js';
// Define your account schema
const accountSchema = new mongoose.Schema({
    id: String,
    balances: [balanceSchema],
    mask: String,
    name: String,
    persistent_account_id: String,
    subtype: String,
    type: String,
    transactions: [transactionSchema],
});

const institutionSchema = new mongoose.Schema({
    id: String,
    name: String
});

export const metadataSchema = new mongoose.Schema({
    accounts: [accountSchema],
    institution: institutionSchema,
    linkSessionId: String,
    plaidAccessToken: String,
    transactionsNextCursor: String,
    transactionsHasMore: Boolean,
    transactionsUpdateStatus: String,
});
