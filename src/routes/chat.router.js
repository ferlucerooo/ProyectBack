import { Router } from 'express';
import messageModel from '../models/message.model.js'

const router = Router ();

router.get('/',async  (req,res)=>{
    try{
        const messages = await messageModel.find().sort({createdAt: -1}).limit(10);
        res.render('chat',{messages});
    }catch (error){
        console.log('Error al obtener los mensajes:', error);
        res.status(500).send('Error al obtener los mensajes');
    }
    //res.render('chat', {});
})
router.post('/', async (req, res)=>{
    try{
        const { user, message } = req.body;
        const newMessage = new messageModel({ user, message });
        await newMessage.save();
        res.status(201).json(newMessage);
        req.app.get('socketServer').emit('newArrived',newMessage);
      } catch (error) {
        res.status(500).json({ error: 'Failed to save message' });
      }
})


export default router;