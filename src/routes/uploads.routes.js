import { Router } from "express";
import { uploader } from '../services/uploader.js';

const router = Router ();

router.post('/products', uploader.array ('productImages', 3), (req, res) => {
    res.status(200).send ({ status: 'OK' ,payload: 'Productos subidos', files: req.files});
});

router.post('/profiles', uploader.array ('profilesImages', 3), (req, res) => {
    res.status(200).send ({ status: 'OK' ,payload: 'Perfil subido', files: req.files});
});

router.post('/documents', uploader.array ('documents', 2), (req, res) => {
    res.status(200).send ({ status: 'OK' ,payload: 'Documentos subidos', files: req.files});
});

export default router;