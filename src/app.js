import express from 'express';
import handlebars from 'express-handlebars';
import config from './config.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import initSocket from './services/socket.js';
import FileStore from 'session-file-store';
import cors from 'cors';
import addLogger from './services/logger.js'



/* import MongoStore from 'connect-mongo'; */



import productsRoutes from './routes/products.routes.js';
import cartsRoutes from './routes/carts.routes.js';
import viewsRoutes from './routes/views.router.js';
import usersRouter from './routes/users.routes.js';
import chatRouter from './routes/chat.router.js';
import cookiesRouter from './routes/cookies.routes.js';
import authRouter from './routes/auth.routes.js'
import loggerTest from './routes/loggerTest.routes.js'
/* import TestRouter from './routes/test.router.js'; */
import MongoSingleton from './services/mongo.singleton.js';
import { errorsHandler } from './services/utils.js';



const app = express ();
const fileStorage = FileStore(session);

    app.use(cors({
        origin: '*'
    }));
    app.use(express.json());             // con esto express es capas de entender la solicitud tipo post con body(json)
    app.use(express.urlencoded({ extended: true })); 
   /*  app.use(express.json({extended: true})); */

    app.use(cookieParser(config.SECRET));
    app.use(session({
       /*  store: MongoStore.create({
            mongoUrl: config.MONGODB_URI,
            ttl: 15 //segundos time to live
        }), */
        store: new fileStorage ({path: './auth', ttl:100, retries:0}),
        secret:config.SECRET,
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize());
    app.use(passport.session());
// motor de plantillas
    app.engine('handlebars', handlebars.engine());
    app.set('views', `${config.DIRNAME}/views`);
    app.set('view engine','handlebars');
//Rutas
    app.use(addLogger);
    app.use('/api/products',productsRoutes);
    app.use('/api/carts', cartsRoutes);
    app.use('/chat',chatRouter);
    app.use('/static', express.static(`${config.DIRNAME}/public`));
    app.use('/',viewsRoutes)
    app.use('/api/users', usersRouter);
    app.use('/api/cookies',cookiesRouter);
    app.use('/api/auth',authRouter);
    app.use('/loggerTest', loggerTest);

    app.use(errorsHandler);
    /* app.use('/api/test', new TestRouter().getRouter()); */


    // Puerto donde escucha el servidor 
    const expressInstance = app.listen(config.PORT, async ()=>{
        MongoSingleton.getInstance();
    //instanciamos el mongoose y que bbdd es a la que nos conectamos
   /*  await mongoose.connect(config.MONGODB_URI); */
    
    const socketServer = initSocket(expressInstance);

    app.set('socketServer', socketServer);
    
    console.log(`Servidor Express activo en el puerto ${config.PORT} enlazada a bbdd ${config.SERVER}`);
});


