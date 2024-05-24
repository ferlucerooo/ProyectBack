import { Router } from "express";
import ProductManager from "../dao/productManager.js";
import productModel from '../dao/models/products.model.js'

const router = Router ();

//const productManager = new ProductManager('products.json');

router.get('/', async (req,res)=>{
    //coneccion por mongoose y mongodb compass, aca se hace la consulta
    try{
        const productsDb = await productModel.find().lean();

        res.status(200).send({payload: productsDb});
        }
    catch (error){
        res.status(500).send('Error al obtener los productos');
    }
    
    
    /* try{
        const products = await productManager.getProducts();

        const limit = req.query.limit;
        
        if(limit){
            res.status(200).send({payload: products.slice(0, parseInt(limit)) });

        }else {
            res.status(200).send({payload: products});

        };

    } catch (error){
        console.error('Error al obtener los productos:', error);
    };
     */
});

router.get('/:pid', async (req, res)=> {

    try{
        const pid = req.params.pid;

        const product = await productModel.findById(pid);
        //const product = await productManager.getProductsById(Number(pid));

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
        const newProduct = new productModel(addProduct);
        const savedProduct = await newProduct.save();
        //const add = await productManager.addProduct(addProduct);
        res.status(201).json(savedProduct);
    }catch(error){
        console.log('Error al agregar el producto',(error));
        res.status(404).send({messag: 'Error al agregar el producto'});
    }
    
})

router.put('/:pid', async (req,res)=>{
    try{
        const pid = req.params.pid;
        const update = req.body;
        const options = {new: true}
        const updatedProduct = await productModel.findByIdAndUpdate(pid, update, options);

        if(updatedProduct){
            res.status(200).send({payload: updatedProduct});
        }else{
            res.status(404).send({message: 'Producto no encontrado'});
        }
    }catch(error){
        console.log('Error al actualizar el producto', error);
        res.status(500).send({message: 'Producto no encontrado'});
    }
    /* const filter = {_id: req.params.id};
    const update = req.body ;
    const options = {new: true};

    const process = await productModel.findOneAndUpdate(filter, update, options)

    res.status(200).send({payload: process}); */
    
/* 
    try{
        const pid = req.params.pid;
        const productUpdate = req.body;

        const productModify = await productManager.updateProduct(pid, productUpdate);
        res.json({ payload: `Producto con el id ${pid} se modifico con exito`, productModify });

    }catch(error){
        console.log('Error al actualizar el Producto',(error));
    } */
})


router.delete('/:pid', async (req,res)=>{

    try{
        const pid = req.params.pid;
        const deleteProduct = await productModel.findByIdAndDelete(pid);

        //const deleteP = await productManager.deleteProduct(pid);

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