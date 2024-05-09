import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import config from './config.js';
import productsRoutes from './routes/products.routes.js';
import cartsRoutes from './routes/carts.routes.js';
import viewsRoutes from './routes/views.router.js';

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
app.use('/static', express.static(`${config.DIRNAME}/public`));
app.use('/',viewsRoutes)


// Puerto donde escucha el servidor 
const httpServer = app.listen(config.PORT, ()=>{
    console.log(`Servidor Express activo en el puerto ${config.PORT}`);
});

const socketServer = new Server(httpServer);

// El método set() nos permite setear objetos globales para nuestra app.
// En este caso lo aprovechamos para socketServer, que luego recuperaremos
// desde los endpoints donde necesitemos publicar mensajes Websockets.
app.set('socketServer', socketServer);

let products = [];

//listener: escucho eventos de coneccion
socketServer.on('connection',client =>{
    console.log(`Cliente conectado, id ${client.id} desde ${client.handshake.address}`);

    //el server logra mostrar el mensaje, emite
    client.on('newMessage', data => {
        Message.push(data);
        console.log(`Mensaje recibido desde ${client.id}: ${data}`);
        client.emit('newMessageConfirmation', data);
    });

    /* client.on('createProduct', formData => {
        console.log('Producto agregado correctamente(server)');
        client.emit('newProduct', formData);
    }) */

    client.on('form_product', (data) => {
        console.log(data);
        products.push(data);
        socketServer.emit('newProduct',data)
    });

})

