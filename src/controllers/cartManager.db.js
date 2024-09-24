import cartModel from "../models/cart.model.js";
//import ProductManagerDB from "../models/products.model.js";
import Ticket from '../models/ticket.model.js'
import CustomError from '../services/errors.js';
import { errorsDictionary } from '../config.js';
import ProductManagerDB from '../controllers/productManager.db.js';
import productModel from '../models/products.model.js';
import { v4 as uuidv4 } from 'uuid';
import mongoose from "mongoose";

class CartManagerDB{
    static #instace;
    constructor(){
        
    };

    static getInstance(){
        if(!CartManagerDB.#instace){
            CartManagerDB.#instace = new CartManagerDB();
        }
        return CartManagerDB.#instace;
    };

    /* validateId(id) {
        if (id.length !== 24) {
            throw new CustomError(errorsDictionary.INVALID_ID, 'El ID debe tener 24 caracteres');
        }
    } */

        validateId(id) {
            if (typeof id !== 'string' || id.length !== 24) {
                throw new CustomError('El ID debe tener 24 caracteres');
            }
        }

    async getCartById(id){
        try{
            console.log('ID recibido:', id); // Depuración
           this.validateId(id);
            const cart = await cartModel.findOne({_id: id}).populate('products.productId').lean();

            if(!cart){
                throw new CustomError(errorsDictionary.ID_NOT_FOUND, `No se encontró el carrito con el ID ${id}`);
            }
            return cart;
        }catch(error){
            throw error;
        }
    };

   /*  async getCartByUserId(userId) {
        return await this.cartModel.findOne({ userId: userId });
    } */

        async getCartByUserId(userId) {
            try {
                const cart = await cartModel.findOne({ userId }).populate('products.productId').lean();
                if (!cart) {
                    throw new CustomError(errorsDictionary.ID_NOT_FOUND, `No se encontró un carrito para el usuario con ID ${userId}`);
                }
                return cart;
            } catch (error) {
                throw error;
            }
        }

    async createCart(userId){
        try{
            /* if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new CustomError('El ID del usuario no es un ObjectId válido');
            } */

            console.log('Creando carrito para el usuario:', userId);
            const cart = await cartModel.create({ 
                userId: new mongoose.Types.ObjectId(userId),  // Aquí se convierte el userId
                products: []
            });
        //const cart = await cartModel.create({ userId: mongoose.Types.ObjectId(userId), products: [] });
        /* const cart = await cartModel.create({
            userId: new mongoose.Types.ObjectId(userId), // Asegúrate de usar "new" aquí
            products: []
        }); */

        if (!cart) {
            throw new CustomError(errorsDictionary.CREATE_ERROR, 'No se pudo crear el carrito');
        }

        console.log('Carrito creado correctamente:', cart);
        return cart;

        
        }catch(error){
            console.error('Error en createCart:', error);
            throw error;
        }
    }
/* 
    async addProductToCart(cid, pid) {
        try {
            await ProductManagerDB.getInstance().getProductById(pid);
            let cart = await this.getCartById(cid);
            const productIndex = cart.products.findIndex(p => p.productId && p.productId._id.toString() === pid);
    
            if (productIndex !== -1) {
                cart.products[productIndex].quantity++;
            } else {
                cart.products.push({ productId: pid, quantity: 1 });
            }
            cart = await cartModel.findByIdAndUpdate(cid, { products: cart.products }, { new: true }).populate('products.productId').lean();
            return cart;
        } catch (error) {
            throw error;
        }
    }
 */

    async addProductToCart(cid, pid, user) {
        try {
            const product = await ProductManagerDB.getInstance().getProductById(pid);
            let cart = await this.getCartById(cid);

            // Verificación si el usuario es premium y es dueño del producto
            if (user.role === 'premium' && product.owner.toString() === user._id.toString()) {
                throw new CustomError(errorsDictionary.OWN_PRODUCT_ERROR, 'Premium users cannot add their own products to the cart');
            }

            const productIndex = cart.products.findIndex(p => p.productId && p.productId._id.toString() === pid);

            if (productIndex !== -1) {
                cart.products[productIndex].quantity++;
            } else {
                cart.products.push({ productId: pid, quantity: 1 });
            }

            cart = await cartModel.findByIdAndUpdate(cid, { products: cart.products }, { new: true }).populate('products.productId').lean();
            return cart;
        } catch (error) {
            throw error;
        }
    }

    async updatedCart (id, products){
        try{
            this.validateId(id);
            const promises = products.map(product => {
                return ProductManagerDB.getInstance().getProductById(product.product)
                .catch(error => {
                    throw error;
                });
            });

            await Promise.all(promises);

            let cart = await this.getCartById(id);

            products.forEach(product => {
                const productIndex = cart.products.findIndex(cartP => cartP.productId && cartP.productId._id && cartP.productId._id.toString() === product.productId);
                 if(productIndex !== -1){
                    cart.products[productIndex].quantity = product.quantity;
                 }else{
                    cart.products.push({ product : product.productId, quantity : product.quantity});
                 }
            });

            await cartModel.updateOne({ _id: id}, { products: cart.products});

            cart = await this.getCartById(id);

            return cart;

        }catch(error){
            throw error;
        }
    };

    async updateProdQuantity(cartId, productId, quantity) {
        try {
            let cart = await this.getCartById(cartId);
            const productIndex = cart.products.findIndex(product => product.productId.id.toString() === productId);
            if(productIndex === -1) {
                throw new CustomError(errorsDictionary.PRODUCT_NOT_FOUND, `No se encontró el producto con ID ${productId} en el carrito con ID ${cartId}`);
            } else {
                cart.products[productIndex].quantity = quantity;
            }

            await cartModel.updateOne({ _id: cartId }, { products: cart.products });
            cart = await this.getCartById(cartId);
            return cart;
        } catch (error) {
            throw error;
        }
    };

    async deleteCart(id) {
        try {
            let cart = await this.getCartById(id);
            await cartModel.updateOne({ _id: id }, { products: [] });

            cart = await this.getCartById(id);
            return cart;
        } catch (error) {
            throw error;
        }
    };

    async deleteProdFromCart(cartId, productId) {
        try {
            let cart = await this.getCartById(cartId);
            console.log('Cart before deletion:', cart);
    
            const productIndex = cart.products.findIndex(product => product.productId && product.productId._id.toString() === productId);
            if (productIndex === -1) {
                throw new CustomError(errorsDictionary.PRODUCT_NOT_FOUND, `No se encontró el producto con ID ${productId} en el carrito con ID ${cartId}`);
            } else {
                cart.products.splice(productIndex, 1);
            }
    
            await cartModel.findByIdAndUpdate(cartId, { products: cart.products }, { new: true }).populate('products.productId').lean();
            cart = await this.getCartById(cartId);
            console.log('Cart after deletion:', cart);
            return cart;
        } catch (error) {
            throw error;
        }
    }


    async purchaseCart(cartId, purchaserEmail) {
        try {
            const cart = await this.getCartById(cartId);
            if (!cart) {
                throw new CustomError(errorsDictionary.NOT_FOUND, 'Carrito no encontrado');
            }
    
            let totalAmount = 0;
            const purchasedProducts = [];
            const failedProducts = [];
    
            for (const item of cart.products) {
                const product = await ProductManagerDB.getInstance().getProductById(item.productId);
                if (product.stock >= item.quantity) {
                    const newStock = product.stock - item.quantity;
    
                    // Actualiza el stock del producto
                    await productModel.findByIdAndUpdate(product._id, { stock: newStock });
    
                    totalAmount += product.price * item.quantity;
                    purchasedProducts.push(item.productId);
                } else {
                    failedProducts.push(item.productId);
                }
            }
    
            const ticket = new Ticket({
                code: uuidv4(),
                amount: totalAmount,
                purchaser: purchaserEmail,
            });
    
            await ticket.save();
    
            // Filtra los productos comprados del carrito
            cart.products = cart.products.filter(item => !purchasedProducts.includes(item.productId));
            await cartModel.updateOne({ _id: cartId }, { products: cart.products });
    
            return {
                message: 'Compra completada',
                ticket,
                failedProducts,
            };
        } catch (error) {
            throw error;
        }
    }

};


export default CartManagerDB;