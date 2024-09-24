import { Router } from "express";
import CartManagerDB from "../controllers/cartManager.db.js";
import { handlePolicies, authMiddleware, verifyToken } from "../services/utils.js";
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

router.post('/', authMiddleware, async (req, res) => {
    try {
        console.log('Usuario en sesión:', req.user);  // Asegúrate de que esto se muestra

        const userId = req.user.id;  // Usa `id` si lo guardaste así en la sesión
        if (!userId) {
            console.log('Sesión no válida o expirada');
            return res.status(400).json({ message: 'User ID is required' });
        }

        const cart = await cartManager.createCart(userId);
        res.json({status: 'success', cartId: cart._id });  // Asegúrate de que esté respondiendo con el carrito
        console.log('Carrito creado con éxito:', cart);
    } catch (error) {
        console.log('Error al crear el carrito:', error);
        res.status(500).json({ error: error.message });
    }
});
// ruta para view
/* router.get('/carts/:cid', async (req,res)=>{
    try{
        const cid = req.params.cid;
        console.log('ID del carrito:', cid);

        const cart = await cartManager.getCartById((cid));
        //console.log('Cart:', JSON.stringify(cart, null, 2));

        if(!cart){
            return res.status(404).send('Carrito no encontrado');
        }

        console.log('Datos del carrito:', JSON.stringify(cart, null, 2));
        res.render('cart', { cart: cart.products, cid:cid });
    }catch(error){
        console.log('Error al obtener el carrito', error);
        res.status(500).json({ error: error.message });
    }
}); */

router.get('/:cid', async (req,res)=>{
    try{
        const cid = req.params.cid;
        console.log(cid);

        const productInCart = await cartManager.getCartById(cid);

        if(productInCart){
            console.log('Carrito encontrado:', productInCart);
            res.render('cart',{cart: productInCart.products, cid});
        }else {
            res.status(404).json({error: 'Carrito no encontrado'})
        }
    }catch(error){
        console.log('Error al obtener el carrito', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/:cid/products/:pid',authMiddleware, async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const user = req.user;

        // Asegúrate de que `req.user` está definido y tiene la propiedad `role`
        if (!user) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        if (!user.role) {
            return res.status(400).json({ error: 'Rol de usuario no disponible' });
        }

        // Verifica el rol del usuario
        if (user.role === 'admin') {
            // Lógica para agregar el producto al carrito (para admin)
        } else if (user.role === 'user') {
            // Verifica si el usuario es el dueño del producto antes de agregarlo
            if (!await cartManager.getCartById(cid, user._id)) {
                return res.status(403).json({ error: 'No autorizado para añadir productos a este carrito' });
            }
        } else {
            return res.status(403).json({ error: 'Rol de usuario no permitido' });
        }

        const result = await cartManager.addProductToCart(cid, pid, user); // Asegúrate de pasar los parámetros correctos
        res.json({status: 'success',payload: result});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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
        /* const {quantity} = req.body; */
        const user = req.user; 
        /* const cart = await cartManager.updateProdQuantity(cid, pid,quantity); */
        await cartManager.addProductToCart(cid, pid, user);
        res.json({ payload: `Producto con id ${pid} agregado al carrito ${cid}` });
        /* res.json({status: 'succes', payload: cart}); */
    } catch (error){
        console.log('Error al actualizar la cantidad del producto en el carrito', error);
        res.status(500).json({error: error.message});
    }
})
// checkout
router.post('/:cid/purchase', async (req, res) => {
    console.log('Sesión en middleware:', req.session.user);
    const cid = req.params.cid;
    console.log('Cart ID:', cid);
    const purchaserEmail = req.session.user.email; 

    try {
        const result = await cartManager.purchaseCart(cid,purchaserEmail );

        const ticket = {
            code: result.ticket.code,
            amount: result.ticket.amount,
            purchaser: result.ticket.purchaser,
            createdAt: result.ticket.createdAt.toISOString(), // Asegúrate de convertir a string si es necesario
        };


         // Si la compra es exitosa, renderizamos la vista de confirmación
         if (result.ticket) {
            console.log('Datos del ticket:', result.ticket);
            res.render('checkout', {
                ticket: ticket,
                message: result.message,
                failedProducts: result.failedProducts
            });
        } else {
            res.status(400).json({ message: 'Error al procesar la compra' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.get('/current',authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id; // Asegúrate de que req.user tenga el ID del usuario
        console.log('ID del usuario:', userId); // Depuración
        const cart = await cartManager.getCartByUserId(userId); // Cambia esto si es necesario para buscar por usuario

        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado para el usuario' });
        }

        res.json({ cartId: cart._id });
    } catch (error) {
        console.error('Error al obtener el carrito:', error); 
        res.status(500).json({ message: 'Error al obtener el carrito' });
    }
});
export default router;