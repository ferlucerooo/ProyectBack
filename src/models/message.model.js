import mongoose from 'mongoose';
mongoose.pluralize(null);
const collection = 'messages';

const messageSchema = new mongoose.Schema({
    user: { type: String, required: true },
    message: { type: String, required: true },
}, {
    timestamps: true
});

const messageModel = mongoose.model(collection, messageSchema);

export default messageModel;