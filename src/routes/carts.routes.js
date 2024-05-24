import { Router } from "express";
import CartManager from '../dao/cartManager.js';

const router = Router ();

const cartManager = new CartManager ('cart.json');


router.post('/',async (req,res)=> {
    try{
        const cart = await cartManager.addCart();
        res.json(cart);
        console.log('Carrito creado');
    }catch(error){
        console.log('Error al crear el carrito');
        res.status(500).json({error: error.message});
    }
});

router.get('/:cid', async (req,res)=>{
    try{
        const cid = req.params.cid;
        console.log(cid);

        const productInCart = await cartManager.getCartById((cid));

        console.log(`Contenido del carrito: ${JSON.stringify(productInCart, null, 2)}`);

        if(productInCart){
            console.log('Carrito encontrado');
            res.json({payload: productInCart});
        }else {
            res.status(404).json({error: 'Carrito no encontrado'})
        }
    }catch(error){
        console.log('Error al obtener el carrito', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/:cid/product/:pid',async (req,res)=>{
    try{
        const {cid, pid}= req.params;
        await cartManager.addProductsToCart(Number(cid), Number(pid));
        res.json({payload: `Producto con id ${pid} agregado al carrito ${cid}`});
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

export default router;