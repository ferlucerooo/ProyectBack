import express from 'express';
import ProductManager from './productManager.js';

const app = express ();

const PORT = 8080;

const productManager = new ProductManager('products.json')

app.get('/',(req,res)=>{
    res.send('Sistema activo');
});


app.get('/products', async (req,res)=>{
    try{
        const products = await productManager.getProducts();

        const limit = req.query.limit;
        
        if(limit){
            res.send({payload: products.slice(0, parseInt(limit)) });

        }else {
            res.send({payload: products});

        };

    } catch (error){
        console.error('Error al obtener los productos:', error);
    };
    
});

app.get('/products/:pid', async (req, res)=> {
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

// Puerto donde escucha el servidor 
app.listen(PORT, ()=>{
    console.log(`Servidor Express activo en el puerto ${PORT}`);
});