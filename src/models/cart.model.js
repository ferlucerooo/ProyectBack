import mongoose from "mongoose";

mongoose.pluralize(null);
const collection = 'carts';


const Schema = new mongoose.Schema({
    products:{
        type:[
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'products',
                    required: true,
                },
                quantity:{
                    type: Number,
                    required: true,
                },
            },
        ],
        default: [],
    }
});

Schema.pre('findOne', function(next) {
    this.populate('products.productId');
    console.log('Populating products.productId');
    next();
});

const cartModel = mongoose.model(collection, Schema);

export default cartModel;