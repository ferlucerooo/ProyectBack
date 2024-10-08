import {Router} from 'express';
import ProductManagerDB from '../controllers/productManager.db.js';
import ProductManager from '../controllers/productManager.js';


const router = Router ();
const productManager = new ProductManager('products.json');
const productManagerdb = ProductManagerDB.getInstance();

router.get('/bienvenida', (req,res)=>{
    const user ={
        firstName: 'carlos'
    }
    res.render('index',user )
})

router.get('/home', async (req,res)=>{
    try{
        const products = await productManager.getProducts();
        res.render('home', {products});

    } catch (error){
        console.error('Error al obtener los productos:', error);
    };
})

router.get('/realtimeproducts', async (req,res)=>{
    try{
        const products = await productManager.getProducts();
        res.render('realTimeProducts', {products});

    } catch (error){
        console.error('Error al obtener los productos:', error);
    };
})





router.post('/realtimeproducts', async (req,res)=>{
    try{
        const socketServer = req.app.get('socketServer');
        const newProduct = req.body;

        const add = await productManager.addProduct(newProduct);
        console.log({add});

        socketServer.emit('newProduct', add)
        //res.render('realTimeProducts', {newProduct});
        const updatedProducts = await productManager.getProducts();
        res.status(200).render('realTimeProducts',{products: updatedProducts});

    }catch(error){
        console.error('Error al agregar el producto:',error);
    }
});




//login 

//falta esto
router.get('/register', (req, res) => {
    res.render('register', {});
});


router.get('/login', (req, res) => {
    // Si hay datos de sesión activos, redireccionamos al perfil
    console.log(req.session.user);
    if (req.session.user){
        return res.redirect('/api/products/products')
    } 
    res.render('login', {});
});

router.get('/profile', (req, res) => {
    // Si NO hay datos de sesión activos, redireccionamos al login
    const user = req.session.user;
  /*   console.log('User data in session:', user); // Para verificar qué datos están en la sesión
    res.render('profile', { user }); */
    /* if (!req.session.user) {
        console.log('User data in session:', user);
        return res.redirect('/login');
    } */

    /*     console.log('User data in session:', req.session.user);
    res.render('profile', { user: req.session.user}); */

    if (user) {
        console.log('User data in session:', user);
        res.render('profile', { user });
    } else {
        res.redirect('/login'); // Redirigir al login si no hay usuario en sesión
    }
});

export default router;