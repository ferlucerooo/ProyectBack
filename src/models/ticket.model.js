import mongoose from "mongoose";

const collection = 'ticket';

const ticketSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        purchaser: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

const ticketModel = mongoose.model(collection, ticketSchema);

export default ticketModel;