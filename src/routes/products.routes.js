import { Router } from "express";
import ProductManager from "../productManager.js";

const router = Router ();

const productManager = new ProductManager('products.json');

router.get('/', async (req,res)=>{
    try{
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
    
});

router.get('/:pid', async (req, res)=> {
    try{
        const pid = req.params.pid;

        const product = await productManager.getProductsById(Number(pid));

        if(product){
            console.log('Producto encontrado');
            res.json({payload: product});

        }else{
            res.json({payload: console.log('Producto no encontrado')});

        }
    }catch(error){
        console.log('Error al pedir el id',(error));
    }

});

router.post('/', async (req,res)=>{
    try{
        const addProduct = req.body;
        
        const add = await productManager.addProduct(addProduct);
        res.json(add);
    }catch(error){
        console.log('Error al agregar el producto',(error));
    }
    
})

router.put('/:pid', async (req,res)=>{
    try{
        const pid = req.params.pid;
        const productUpdate = req.body;

        const productModify = await productManager.updateProduct(pid, productUpdate);
        res.json({ payload: `Producto con el id ${pid} se modifico con exito`, productModify });

    }catch(error){
        console.log('Error al actualizar el Producto',(error));
    }
})


router.delete('/:pid', async (req,res)=>{
    try{
        const pid = req.params.pid;

        const deleteP = await productManager.deleteProduct(pid);

        if(deleteP){
            res.json({payload: deleteP})
            console.log('Producto encontrado y eliminado');
        }else {
            res.json({payload: console.log('Producto que intenta eliminar no encontrado')})
        }
    }catch(error){
        console.log('',(error));                                                                                                                                                                        
    }
})




/* app.post('/',uploader.single('thumbnail'),(req,res)=>{
    console.log(req.file);
    console.log(req.body);


    // res.status(200).send({payload: req.body});


    const {email ='', password = ''}= req.body;
    if(body.password.length <8){
        res.status(400).send({payload: [], error: 'Pw minimo de 8 caracteres'})
    } else{
        res.status(200).send({payload: body});
    }
}) */

/* app.delete('/:uid',(req,res)=>{
    const id= req.params.uid;
    res.status(200).send({payload: `Quiere borrar el registro ${id}`})
}) */






export default router;