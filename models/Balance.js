import mongoose from 'mongoose';

export const balanceSchema = new mongoose.Schema({
    available: { type: Number },
    current: { type: Number },
    iso_currency_code: { type: String },
    limit: { type: Number },
    unofficial_currency_code: { type: String },
});


