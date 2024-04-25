import fs from 'fs';

const CART_FILE = './src/cart.json';

export default class CartManager {
    constructor() {
        this.carts = [];
    }

    async saveFile() {
        try {
            await fs.promises.writeFile(CART_FILE, JSON.stringify(this.carts, null, 2), 'utf-8');
            console.log('Carrito guardado correctamente');
        } catch (error) {
            console.error('Error al guardar el carrito:', error);
        }
    }

    async loadFile() {
        try {
            const data = await fs.promises.readFile(CART_FILE, 'utf-8');
            this.carts = JSON.parse(data);
        } catch (error) {
            console.error('Error al cargar el carrito:', error);
            this.carts = [];
        }
    }

    async getCartById(id) {
        try{
            await this.loadFile();
            const cart = this.carts.find((c) => c.id === id);
            if (cart) {
                console.log(`Carrito encontrado: ${JSON.stringify(cart, null, 2)}`);
                return cart;
            } else {
                console.log('Error: Carrito no encontrado');
            }
        }catch(error){
            console.log('Error al buscar el carrito', error);
        }
            
    }

    async addCart() {
        try {
            await this.loadFile();
            const newCart = {
                id: this.carts.length !== 0 ? this.carts[this.carts.length - 1].id + 1 : 1,
                products: []
            };
            this.carts.push(newCart); 
            await this.saveFile();
            console.log('Carrito creado:', newCart); 
            return newCart;
        } catch (error) {
            console.error('Error al crear el carrito:', error);
            throw error;
        }
    }

    async addProductsToCart(cartId, productId) {
        try {
            await this.loadFile();
            const cart = this.carts.find((c) => c.id === cartId);
            if (!cart) {
                console.error('Error: Carrito no encontrado');
                return null;
            }
            const existingProduct = cart.products.find((p) => p.product === productId);
            if (existingProduct) {
                existingProduct.quantity++;
            } else {
                cart.products.push({ product: productId, quantity: 1 });
            }
            await this.saveFile();
            console.log(`Producto ${productId} agregado al carrito ${cartId}`);
            return cart;
        } catch (error) {
            console.error('Error al agregar productos al carrito:', error);
            throw error;
        }
    }
}
