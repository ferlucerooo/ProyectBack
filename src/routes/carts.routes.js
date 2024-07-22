import { Router } from "express";
import CartManagerDB from "../controllers/cartManager.db.js";
import { handlePolicies } from "../services/utils.js";
import nodemailer from 'nodemailer';
import config from "../config.js";

const router = Router ();

const cartManager = CartManagerDB.getInstance();

const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.GMAIL_APP_USER,
        // Atención!, si se va a aplicar un STMP de Gmail,
        // NO podrá usarse la clave original, se debe generar
        // una clave de app en su lugar:
        // https://myaccount.google.com/apppasswords.
        pass: config.GMAIL_APP_PASS
    }
});

router.get('/mail', async (req, res) => {
    try {
        // Utilizando el transporte, podemos enviar a través
        // del SMTP que hayamos configurado, mensajes vía email
        // a los destinatarios que deseemos
        const confirmation = await transport.sendMail({
            from: `Sistema Coder <${config.GMAIL_APP_USER}>`, // email origen
            to: 'ferlucero2210@gmail.com',
            subject: 'Pruebas Nodemailer',
            html: '<h1>Prueba 01</h1>'
        });
        res.status(200).send({ status: 'OK', data: confirmation });
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
});

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
// ruta para view
router.get('/carts/:cid', async (req,res)=>{
    try{
        const cid = req.params.cid;
        console.log(cid);

        const cart = await cartManager.getCartById((cid));
        console.log('Cart:', JSON.stringify(cart, null, 2));

        if(!cart){
            return res.status(404).send('Carrito no encontrado');
        }
        res.render('cart', { cart: cart.products });
    }catch(error){
        console.log('Error al obtener el carrito', error);
        res.status(500).json({ error: error.message });
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

router.put('/:cid', async (req,res)=>{
    try{
        const {cid} = req.params;
        const products = req.body.products;
        const cart = await cartManager.updatedCart(cid, products);
        res.json({status: 'succes', payload: cart})
    } catch (error) {
        console.log('Error al actualizar el carrito', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:cid/product/:pid', async (req,res)=>{
    try{
        const {cid, pid} = req.params;
        const {quantity} = req.body;
        const cart = await cartManager.updateProdQuantity(cid, pid, quantity);
        res.json({status: 'succes', payload: cart});
    } catch (error){
        console.log('Error al actualizar la cantidad del producto en el carrito', error);
        res.status(500).json({error: error.message});
    }
})

router.post('/:cid/purchase', handlePolicies('user'), async (req, res) => {
    const cartId = req.params.cid;
    const purchaserEmail = req.user.email; 

    try {
        const result = await cartManager.purchaseCart(cartId, purchaserEmail);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;