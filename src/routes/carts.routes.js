import { Router } from "express";
import CartManagerDB from "../dao/cartManager.db.js";

const router = Router ();

const cartManager = CartManagerDB.getInstance();

router.post('/',async (req,res)=> {
    try{
        const cart = await cartManager.createCart();
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
        await cartManager.addProductToCart(cid, pid);
        res.json({payload: `Producto con id ${pid} agregado al carrito ${cid}`});
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

router.delete('/:cid/product/:pid', async (req,res)=>{
    try{
        const {cid, pid} = req.params;
        const cart = await cartManager.deleteProdFromCart(cid, pid);
        
        res.json({status: 'succes', payload: cart});
    }catch(error){
        res.status(500).json({error : error.message});
    }
})

router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        await cartManager.deleteCart(cid);
        res.json({ status: 'success', message: `Carrito con id ${cid} eliminado` });
    } catch (error) {
        console.log('Error al eliminar el carrito', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;