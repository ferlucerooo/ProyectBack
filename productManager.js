import fs from 'fs';
const DESTINATION_FILE = './products.json';

class ProductManager {
    constructor(){
        
        this.products = [];
        this.nextProductId = 1;
    }
     async addProduct(product){
        //validar que no se repita ningun campo
        if(!product.title || !product.description || !product.price || !product.thumbnail || !product.code || !product.stock){
            console.log('Todos los campos son obligatorios');
            return;
        }
        //Busca que no se repita el code
        if(this.products.some((p)=> p.code === product.code)){
            console.log('Error: El codigo ya existe');
            return;
        }
        //Id autoincrementable
        product.id = this.nextProductId++;

        //se agrega al array de products
        this.products.push(product);

        // escritura del json
        const data = JSON.stringify(this.products, null, 2);
        try{
            await fs.promises.writeFile(DESTINATION_FILE, data);
            console.log("Escritura correcta del archivo");
        } catch(error){
            console.error("Los datos del archivo no se guardaron", error);
        }
    };

    async getProducts(){
        try {
            const writeFile =await fs.promises.readFile(DESTINATION_FILE, 'utf-8');
            const product = JSON.parse(writeFile);
            this.products = product;
            return this.products;
        } catch(error) {
            console.log("Error al leer el archivo:", error);
            return [];
        }
        
    };

    getProductsById(id){
        const product = this.products.find ((p)=> p.id === id);
        if(product){
            console.log(`Producto encontrado: ${product}`);
            return product;
        }else {
            console.log('Error: Producto no encontrado');
        };

    };
    async updateProduct (id, updatedProduct){
        const productIndex = this.products.findIndex((p) => p.id === id);
        if(productIndex !== -1){
            const updatedProductData = {...this.products[productIndex],...updatedProduct};
            this.products[productIndex] = updatedProductData;

            const data = JSON.stringify(this.products, null, 2);

            try{
                await fs.promises.writeFile(DESTINATION_FILE, data);
                console.log("Producto actualizado.");
            } catch(error){
                console.error("Error al actualizar el producto:",error);
            }
        }else {
            console.error("Producto no encontrado");
        }
    } 

    async deleteProduct(id){
        const productIndex = this.products.findIndex((p) => p.id === id);

        if(productIndex !== -1){
            this.products.splice(productIndex, 1);
            const updatedData = JSON.stringify(productIndex, null , 2);

            try{
                await fs.promises.writeFile(DESTINATION_FILE, updatedData);
                console.log("Producto eliminado correctamente");
            } catch(error){
                console.error("Producto no encontrado");
            }
        }
    }

    async deleteFile (){
        try{
            await fs.promises.unlink(DESTINATION_FILE);
            console.log("Archivo eliminado");
        } catch(error){
            console.error("Error al elminar el archivo");
        }
    }

};


class Product {
    constructor(title, description, price, thumbnail, code, stock){
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnail = thumbnail;
        this.code = code;
        this.stock = stock;
    }

};


//test
const test = async () => {
    const productManager = new ProductManager();

    await productManager.addProduct({
        title: 'Producto 1',
        description: 'Descripcion del producto 1',
        price: 100,
        thumbnail: 'imagen1.jpg',
        code: 'P001',
        stock: 10,
    });
    await productManager.addProduct({
        title: 'Producto 2',
        description: 'Descripcion del producto 2',
        price: 150,
        thumbnail: 'imagen2.jpg',
        code: 'P002',
        stock: 20
    });
    console.log('Todos los productos:',await productManager.getProducts());
    
    console.log('Actualizacion correcta', await productManager.updateProduct(1,{ price: 250}));

    console.log('Todos los productos:',await productManager.getProducts());

    const foundProduct = await productManager.getProductsById(2);
    console.log('Producto encontrado mediante id:',foundProduct);

    const deleteProduct = await productManager.deleteProduct(2);
    console.log('Producto eliminado', deleteProduct);

    console.log('Todos los productos:',await productManager.getProducts());

    console.log('Eliminacion del archivo', await productManager.deleteFile());
}
test();

