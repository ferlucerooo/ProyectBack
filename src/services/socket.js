import { Server } from "socket.io";
import messageModel from '../models/message.model.js'


const initSocket = (httpServer) => {

    let products = [];
    // cambiarlo por lo de mongodb(bbdd) 
    //let messages = [];

    const io = new Server(httpServer);

    
//listener: escucho eventos de coneccion
io.on('connection',async (client) =>{
    console.log(`Cliente conectado, id ${client.id} desde ${client.handshake.address}`);

    try{
        //se agrego esto y el async
            const messages = await messageModel.find().sort({ createdAt: -1 }).limit(10).exec();
            client.emit('chatLog', messages);
            //el server logra mostrar el mensaje, emite
    }catch (error){
        console.error('Error al guardar el nuevo mensaje:', error);
    }


    client.on('newMessage',async (data) => {
        console.log(data);
        try{
            const newMessage = new messageModel(data);
            await newMessage.save();
            console.log(`Mensaje recibido desde ${client.id}: ${data.user} ${data.message}`);

            io.emit('MessageArrived', data);
        }catch(error){
            console.error('Error al guardar el mensaje', error);
        }
        // en ves del push actualizar la bbdd
       /*  messages.push(data);
        console.log(`Mensaje recibido desde ${client.id}: ${data.user} ${data.message}`);

        io.emit('messageArrived', data); */
    });

    

    client.on('form_product', (data) => {
        console.log(data);
        products.push(data);
        io.emit('newProduct',data)
    });

})
return io;
};

export default initSocket;