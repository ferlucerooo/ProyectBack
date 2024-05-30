import { Router } from "express";
import config from '../config.js'
import ProductManagerDB from "../dao/productManager.db.js";

const router = Router ();
const productManager = ProductManagerDB.getInstance();



router.get('/', async (req,res)=>{
    try{
        //const productsDb = await productManager.getProducts().find({role:'premium'}).lean();
        //const productsDb = await productManager.getProducts().find().skip().limit(8).lean();
        //const productsDb = await productManager.getProducts().find().skip(8).limit(8).lean();
        //const productsDb = await productManager.getProducts().paginate();
        /* const productsDb = await productManager.getProducts().paginate({
            gender:'Female' o req.params.type ,{ limit:5, page: 1  }
        }); */
       /*  .agregate([
            {$match: {stock:  req.params.type }},
            {$group:{_id: '$price', totalPrice: {$sum: '$price'}}},
            {$sort: {totalPrice: -1}}          //-1 descendente, 1 ascendente
        ]); */
        /* const productsDb = await productManager.getProducts().paginate({limit: req.params.type}, {limit:5, page:6}).sort({}); */
        const limit = parseInt(req.query.limit) || 5;
        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort === 'asc' ? 1 : req.query.sort === 'des' ? -1 : null;
        const query = req.query.query || {};
        const category = req.query.category ? { category: req.query.category } : {};

        const productsDb = await productManager.getProducts(limit, page, sort, query,category);

        res.status(200).send({origin: config.SERVER, payload: productsDb});
        }
    catch (error){
        res.status(500).send('Error al obtener los productos');
    }
    
});



router.get('/', async (req,res)=>{
    try{
        
        const productsDb = await productManager.getProducts();

        res.status(200).send({origin: config.SERVER, payload: productsDb});
        }
    catch (error){
        res.status(500).send('Error al obtener los productos');
    }
    
});

router.get('/:pid', async (req, res)=> {

    try{
        const pid = req.params.pid;
        const product = await productManager.getProductById(pid);

        if(product){
            console.log('Producto encontrado');
            res.json({payload: product});

        }else{
            res.json({message: 'Producto no encontrado'});

        }
    }catch(error){
        console.log('Error al pedir el id',(error));
        res.status(404).send({messag: 'Producto no encontrado'});
    }

});

router.post('/', async (req,res)=>{
    try{
        const addProduct = req.body;
        const newProduct = await productManager.addProduct(addProduct);

        res.status(201).json(newProduct);
    }catch(error){
        console.log('Error al agregar el producto',(error));
        res.status(404).send({message: 'Error al agregar el producto'});
    }
    
})

router.put('/:pid', async (req,res)=>{
    try{
        const pid = req.params.pid;
        const update = req.body;
        const updatedProduct = await productManager.updatedProduct(pid, update);

        if(updatedProduct){
            res.status(200).send({payload: updatedProduct});
        }else{
            res.status(404).send({message: 'Producto no encontrado'});
        }
    }catch(error){
        console.log('Error al actualizar el producto', error);
        res.status(500).send({message: 'Producto no encontrado'});
    }

})

router.delete('/:pid', async (req,res)=>{

    try{
        const pid = req.params.pid;
        const deleteProduct = await productManager.deleteProduct(pid);


        if(deleteProduct){
            res.json({payload: deleteProduct})
            console.log('Producto encontrado y eliminado');
        }else {
            res.status(404).send({message: 'Producto no encontrado'});
        }
    }catch(error){
        console.log('Error al eliminar el producto',(error)); 
        res.status(500).send({messag: 'Error al eliminar el producto'});                                                                                                                                                                       
    }
})


export default router;