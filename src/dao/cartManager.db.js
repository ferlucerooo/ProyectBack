import cartModel from "./models/cart.model.js";
import ProductManagerDB from "./productManager.db.js";

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

    async getCartById(id){
        try{
            if(id.length !== 24){
                throw new Error('el id debe tener 24 caracteres');
            }
            const cart = await cartModel.findOne({_id: id});

            if(!cart){
                throw new Error(`No se encontro el carrito con el id ${id}`);
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
                throw new Error ('No se pudo crear el carrito');
            }

            return cart;
        }catch(error){
            throw error;
        }
    }

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

    async updatedCart (id, products){
        try{
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
                throw new Error(`No se encontró el producto con id ${productId} en el carrito con id ${cartId}`);
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
                throw new Error(`No se encontró el producto con id ${productId} en el carrito con id ${cartId}`);
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
};

export default CartManagerDB;