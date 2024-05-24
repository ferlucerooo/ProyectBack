import express from 'express';
import handlebars from 'express-handlebars';
import config from './config.js';
import productsRoutes from './routes/products.routes.js';
import cartsRoutes from './routes/carts.routes.js';
import viewsRoutes from './routes/views.router.js';
import chatRouter from './routes/chat.router.js';
import initSocket from './socket.js'
import mongoose from 'mongoose';

const app = express ();

app.use(express.json());             // con esto express es capas de entender la solicitud tipo post con body(json)
app.use(express.json({extended: true}));
// motor de plantillas
app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set('view engine','handlebars');
//Rutas
app.use('/api/products',productsRoutes);
app.use('/api/carts', cartsRoutes);
app.use('/chat',chatRouter);
app.use('/static', express.static(`${config.DIRNAME}/public`));
app.use('/',viewsRoutes)


// Puerto donde escucha el servidor 
const expressInstance = app.listen(config.PORT, async ()=>{
    //instanciamos el mongoose y que bbdd es a la que nos conectamos
    await mongoose.connect(config.MONGODB_URI);
    console.log(`Servidor Express activo en el puerto ${config.PORT} enlazada a bbdd`);
});
const socketServer = initSocket(expressInstance);

// El método set() nos permite setear objetos globales para nuestra app.
// En este caso lo aprovechamos para socketServer, que luego recuperaremos
// desde los endpoints donde necesitemos publicar mensajes Websockets.
app.set('socketServer', socketServer);