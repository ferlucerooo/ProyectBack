import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

mongoose.pluralize(null);
//se cambio la collection para hacer los test
const collection = 'users';

const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true, index: false },
    email: { type: String, required: true,index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'premium', 'user'], default: 'user' },
    resetToken: String,
    resetTokenExpiration: Date,
    documents:[
        {
            name:{type: String, required: true},
            reference:{type: String, required: true},
        }
    ],
    lastConnection: {type: Date},  // aca almacenamos la ultima coneccion
});

schema.plugin(mongoosePaginate);

const model = mongoose.model(collection, schema);

export default model;