import productModel from '../models/products.model.js'

class ProductManagerDB {
    static #instance;

    constructor(){
        this.products = [];
    }
    /* static getInstance(){
        if(!ProductManagerDB.#instance){
            ProductManagerDB.#instance = new ProductManagerDB();
        }
        return ProductManagerDB.#instance;
    } */

        static getInstance() {
            if (!this.#instance) {
                this.#instance = new ProductManagerDB();
                console.log('Instancia de ProductManagerDB creada');
            } else {
                console.log('Instancia de ProductManagerDB reutilizada');
            }
            return this.#instance;
        }

    async getProducts(limit = 5, page = 1, sort = null, query = {}, category = {}) {
        try {
            const options = {
                limit: limit,
                page: page,
                lean: true,
            };
    
            if (sort) {
                options.sort = { price: sort };
            }
    
            const queryObj = {
                ...query,
                ...category // Incorporamos el filtro por categoría en la consulta
            };
    
            const products = await productModel.paginate(queryObj, options);
    
            if (!products) {
                throw new Error('No se encontraron productos');
            }

            if(query.owner) {
                queryObj.owner = query.owner; // Filtrar por propietario si se proporciona
            }
    
            return products;
        } catch (error) {
            throw error;
        }
    }
async getProductById(id){
    try{
        const product = await productModel.findById(id);
        if(!product){
            throw new Error(`No se encontro el producto con id ${id}`);
        }
        return product;
    }catch(error){
        throw error;
    }
}


    async addProduct(product){
        try{
            product = await productModel.create(product);
            if(!product){
                throw new Error('No se pudo crear el producto');
            }
            if (!product.owner) {
                throw new Error('El producto debe tener un propietario');
            }
            return product;
        }catch(error){
            if(error.code === 11000){
                throw new Error (`Ya existe el producto con codigo ${product.code}`);
            }
            throw error;
        }
    }

    async updatedProduct(id, product){
        try{
            if(id.length !== 24){
                throw new Error ('El id debe tener 24 caracteres');
            }
            product = await productModel.findByIdAndUpdate({_id: id}, product,{new: true});
            if(!product){
                throw new Error (`No se encontro el producto con id ${id}`);
            }
            return product;
        }catch(error){
            if(error.code ===11000){
                throw new Error(`Ya existe un producto con el codido ${product.code}`);
            }
            throw error;
        }
    }

    async deleteProduct (id){
        try{
            const product = await productModel.findByIdAndDelete({_id: id});
            if(!product){
                throw new Error(`No se encontro el producto con id ${id}`);
            }
            return product;
        }catch(error){
            throw error;
        }
    }

}
export default ProductManagerDB;