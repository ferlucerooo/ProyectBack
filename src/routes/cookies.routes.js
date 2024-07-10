import { Router } from "express";
import config from '../services/config.js';

const router = Router();

router.get('/setcookie',async (req,res)=>{
    try{
        const user = {user: 'flucero', email: 'ferl@gmail.com'};
        res.cookie('cookiecoder',JSON.stringify(user),{maxAge: 30000, signed: true});
        res.status(200).send({origin: config.SERVER, payload: 'Cookie generada'})
    }catch(error){
        res.status(500).send({ origin: config.SERVER, payload: null, error: error.message})
    }
});

router.get('/getcookie',async (req,res)=>{
    try{
        console.log(req.signedCookies);
        //recupero la cookie
        const data = JSON.parse(req.signedCookies['cookiecoder']);
        res.status(200).send({origin: config.SERVER, payload: req.signedCookies});
    }catch(error){
        res.status(500).send({ origin: config.SERVER, payload: null, error: error.message});
    }
});


router.get('/deletecookie',async (req,res)=>{
    try{
        res.clearCookie('cookiecoder');
        res.status(200).send({origin: config.SERVER, payload: 'Cookie eliminada'})
    }catch(error){
        res.status(500).send({ origin: config.SERVER, payload: null, error: error.message})
    }
});




export default router;