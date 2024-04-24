import express from 'express';
import config from './config.js';
import productsRoutes from './routes/products.routes.js';


const app = express ();


app.use(express.json());             // con esto express es capas de entender la solicitud tipo post con body(json)
app.use(express.json({extended: true}));
app.use('/api/products',productsRoutes);
app.use('api/carts', cartsRoutes);
app.use('/static', express.static(`${config.DIRNAME}/public`));


// Puerto donde escucha el servidor 
app.listen(config.PORT, ()=>{
    console.log(`Servidor Express activo en el puerto ${config.PORT}`);
});