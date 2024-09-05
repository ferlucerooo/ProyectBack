import cartModel from "../models/cart.model.js";
//import ProductManagerDB from "../models/products.model.js";
import Ticket from '../models/ticket.model.js'
import CustomError from '../services/errors.js';
import { errorsDictionary } from '../config.js';
import ProductManagerDB from '../controllers/productManager.db.js';
import productModel from '../models/products.model.js';
import { v4 as uuidv4 } from 'uuid';

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

    validateId(id) {
        if (id.length !== 24) {
            throw new CustomError(errorsDictionary.INVALID_ID, 'El ID debe tener 24 caracteres');
        }
    }

    async getCartById(id){
        try{
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

    async createCart(){
        try{
            const cart = await cartModel.create({});

            if(!cart){
                throw new CustomError(errorsDictionary.CREATE_ERROR, 'No se pudo crear el carrito');
            }

            return cart;
        }catch(error){
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


    
   /*  async punchaseCart(cart) {
        try {
            console.log('Carrito a cerrar', cart);
            //console.log('Array de productos del carrito', cart.products);
            let totalTicket = 0;
            let cartUpdate = [];
            for (let i = 0; i < cart.products.length; i++) {
                if (cart.products[i]._id.stock >= cart.products[i].quantity) {
                    console.log('Si alcanza', cart.products[i]);
                    totalTicket =+ (cart.products[i].quantity * cart.products[i]._id.price);
                    const prodManager = new ProductManager();
                    const cantNewStock = cart.products[i]._id.stock - cart.products[i].quantity
                    
                    const prodEdit = await prodManager.updateProduct(cart.products[i]._id._id, { stock: cantNewStock } );
                    
                    cartUpdate = cart.products.splice(i, 1);
                    i--; // Decrementar el índice para ajustar el desplazamiento del array
                } else {
                    console.log('No alcanza');
                }
            };

            if (totalTicket > 0) {
                console.log('req.session.user: ', req.session.user)
                    
                const ticket = {
                    code: uuidv4(),
                    amount: totalTicket,
                    purchaser: 'ttttt'
                }
                
                console.log('Ticket: ', ticket);            
            }
            
            const cartResult = await service.update(cart._id, cart);

            return cartResult
            
        } catch (error) {
            console.log('Error al borrar los productos del carrito ttttttttttttttttttttttt.');
            console.log(error);
        }
    }
};
 */

/* async purchaseCart(cartId, purchaserEmail) {
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
                product.stock -= item.quantity;
                await product.save();
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

        // Filtrar los productos comprados del carrito
        cart.products = cart.products.filter(item => !purchasedProducts.includes(item.productId));
        await cartModel.updateOne({ _id: cartId }, { products: cart.products });

        return {
            message: 'Purchase completed',
            failedProducts,
        };
    } catch (error) {
        throw error;
    }
} */

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