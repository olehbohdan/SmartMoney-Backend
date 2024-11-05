import mongoose from 'mongoose';
// Define your account schema
const accountSchema = new mongoose.Schema({
    id: String,
    mask: String,
    name: String,
    subtype: String,
    type: String
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
});
