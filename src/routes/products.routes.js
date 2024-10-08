import { Router } from "express";
import config from '../config.js'
import ProductManagerDB from "../controllers/productManager.db.js";
import { verifyToken, handlePolicies,verifyMongoDBId, authMiddleware} from "../services/utils.js";
import {generateMockProducts} from '../services/mocking.js'


const router = Router ();
const productManager = ProductManagerDB.getInstance();

router.param('id', verifyMongoDBId());


router.get('/products', async (req,res)=>{
    try{
        
        const user = req.session.user;
        console.log('Usuario en sesión al acceder a productos:', user); 
        const limit = parseInt(req.query.limit) || 5;
        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort === 'asc' ? 1 : req.query.sort === 'des' ? -1 : null;
        const owner = req.query.owner || null;
        const query = req.query.query ? JSON.parse(req.query.query) : {}; // Consulta adicional
        const category = req.query.category ? { category: req.query.category } : {}; // Filtro por categoría

       

        const result = await productManager.getProducts(limit, page, sort, query,category, owner);
        /* console.log(result); */
        res.render('products', {
            user: user,
            products: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            limit: limit
        });

    }  catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send('Error al obtener los productos. Por favor, inténtalo de nuevo más tarde.');
    }
});

router.get('/', async (req,res)=>{
    try{
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

/* router.get('/', async (req,res)=>{
    try{
        
        const productsDb = await productManager.getProducts();

        res.status(200).send({origin: config.SERVER, payload: productsDb});
        }
    catch (error){
        res.status(500).send('Error al obtener los productos');
    }
    
}); */

router.get('/:pid', async (req, res)=> {

    try{
        const pid = req.params.pid;
        const product = await productManager.getProductById(pid);
        //const product = await productManager.getProductById(req.params.id);

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

router.get('/mocking/:qty', async (req,res)=> {
    const qty = parseInt(req.params.qty, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).send({ status: 'ERROR', message: 'Invalid quantity' });
    }
    const data =  generateMockProducts(qty);
    res.status(200).send({ status: 'OK', payload: data });
    console.log(data);
  });

router.post('/',verifyToken, handlePolicies('admin', 'premium'), async (req,res)=>{
    try{
        const addProduct = {...req.body,owner: req.user.id};
        const newProduct = await productManager.addProduct(addProduct);

        res.status(201).json(newProduct);
    }catch(error){
        console.log('Error al agregar el producto',(error));
        res.status(404).send({message: 'Error al agregar el producto'});
    }
    
})

router.put('/:pid',verifyToken, handlePolicies('admin', 'premium'), async (req,res)=>{
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

router.delete('/:pid', verifyToken,handlePolicies('admin'), async (req,res)=>{

    try{
        const pid = req.params.pid;
        
        const product = await productManager.getProductById(pid);

        if (!product) {
            return res.status(404).send({ message: 'Producto no encontrado' });
        }

        if (product.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado para eliminar este producto' });
        }

        const deleteProduct = await productManager.deleteProduct(pid);
        
        if(deleteProduct){
            res.json({payload: deleteProduct})
            console.log('Producto encontrado y eliminado');
        }else {
            res.status(404).send({message: 'Producto no encontrado'});
        }
    }catch(error){
        console.log('Error al eliminar el producto',(error)); 
        res.status(500).send({message: 'Error al eliminar el producto'});                                                                                                                                                                       
    }
})

router.all('*', async (req, res) => {
    res.status(404).send({ origin: config.SERVER, payload: null, error: 'No se encuentra la ruta solicitada' }); 
    
    req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
});

export default router;