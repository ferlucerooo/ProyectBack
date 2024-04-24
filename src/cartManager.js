import fs from 'fs';
const CART_FILE = './cart.json';

export default class CartManager {
    constructor(){
        this.carts = [];
    }


    async saveFile(){
        try{
            await fs.promises.writeFile(CART_FILE, JSON.stringify(this.carts, null, '/t'), 'utf-8');
            console.log('Carrito guardado correctamente');
        }catch(error){
            console.log('Error en el guardado', error);
        }
    }

    getCartById(id){
        const product = this.products.find ((p)=> p.id === id);
        if(product){
            console.log(`Producto encontrado: ${JSON.stringify(product, null, 2)}`);
            return product;
        }else {
            console.log('Error: Producto no encontrado');
        };

    };


    async getCart(){
        try{
            const readFile = await fs.promises.readFile(CART_FILE, 'utf-8');
            const cart = JSON.parse(readFile);
            this.carts = cart;
            return this.carts;
        }catch(error){
            console.log('Error al leer el carrito', error);
            return [];
        }
    }
    async addCart(){
        const cart = new Cart();
        cart.id = this.carts.length === 0 ? 1 : this.carts[this.carts.length - 1].id + 1;
        cart.products = [];
        this.carts.push(cart);
        this.saveFile();
        return cart;
    }

    async addProductsToCart (cid, pid){
        const cartIndex = this.carts.findIndex((c)=> c.id === cid )
        const cartUse = this.carts[cartIndex];

        if(cartIndex === -1){
            console.log('Carrito inexistente');
        }

        const productIndex = cartUse.products.findIndex((p)=> p.product === pid);

        if(productIndex === -1){
            cartUse.products.push({'product': pid, 'quantity': 1})
        }else {
            cartUse.products[productIndex].quantity += 1;
        }
//actualizar el carrito en la lista del mismo
        this.carts[cartIndex] = cartUse;
//guardar los cambios 
        await this.saveFile();

        return this.carts[cartIndex];
    }


    async deleteCart(id){
        const cartIndex = this.carts.findIndex((c)=> c.id === id);

        if(cartIndex !== - 1){
            this.carts.splice(cartIndex, 1);
            const updateData = JSON.stringify(cartIndex, null ,2);
            this.saveFile();
            console.log('Carrito eliminado correctamente');
            /* try{
                await fs.promises.writeFile(CART_FILE, updateData);
                console.log('Producto eliminado correctamente');
            }catch(error){
                console.log('Producto no encontrado');
            } */
        }else {
            console.log('Error al eliminar el carrito');
        }
    }
    async deleteFile (){
        try{
            await fs.promises.unlink(CART_FILE);
            console.log('Carrito eliminado');
        }catch(error){
            console.log('Error al eliminar el carrito');
        }
    }

}

class Cart {
    constructor(){
        this.products = [];
    }
}
