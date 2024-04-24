import { Router } from "express";
import CartManager from '../cartManager.js';

const router = Router ();

const cartManager = new CartManager ('./cart.json');


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

        const productInCart = await cartManager.getCartById(Number(cid));

        if(productInCart){
            console.log('Producto encontrado');
            res.json({payload: productInCart});
        }else {
            res.json({payload: console.log('Producto no encontrado')})
        }
    }catch(error){
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