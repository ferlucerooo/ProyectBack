import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const collection = 'ticket';

const ticketSchema = new mongoose.Schema({
    code: { type: String, unique: true, default: uuidv4 },
    purchase_datetime: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    purchaser: { type: String, required: true }
});

const Ticket = mongoose.model(collection, ticketSchema);
export default Ticket;