class ProductManager {
    constructor(){
        this.products = [];
        this.nextProductId = 1;
    }
    addProduct(product){
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

    };

    getProducts(){
        return this.products;
    };

    getProductsById(id){
        const product = this.products.find ((p)=> p.id === id);
        if(product){
            return product;
        }else {
            console.log('Error: Producto no encontrado');
        };

    };

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
const productManager = new ProductManager();

productManager.addProduct({
    title: 'Producto 1',
    description: 'Descripcion del producto 1',
    price: 100,
    thumbnail: 'imagen1.jpg',
    code: 'P001',
    stock: 10,
});
productManager.addProduct({
    title: 'Producto 2',
    description: 'Descripcion del producto 2',
    price: 150,
    thumbnail: 'imagen2.jpg',
    code: 'P002',
    stock: 20
});
console.log('Todos los productos:', productManager.getProducts());

const foundProduct = productManager.getProductsById(2);
console.log('Producto encontrado:',foundProduct);