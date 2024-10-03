import { Router } from 'express';
import config from '../config.js';
import UsersManager from '../controllers/usersManager.db.js';
import { verifyRequiredBody, verifyToken, handlePolicies } from '../services/utils.js';
import { uploader } from '../services/uploader.js';
import moment from 'moment';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import usersModel from '../models/users.model.js'

const router = Router();
const manager = new UsersManager();

router.get('/aggregate/:role', async (req, res) => {
    try {
        if (req.params.role === 'admin' || req.params.role === 'premium' || req.params.role === 'user') {
            const match = { role: req.params.role };
            const group = { _id: '$region', totalGrade: {$sum: '$grade'} };
            const sort = { totalGrade: -1 };
            const process = await manager.getAggregated(match, group, sort);

            res.status(200).send({ origin: config.SERVER, payload: process });
        } else {
            res.status(200).send({ origin: config.SERVER, payload: null, error: 'role: solo se acepta admin, premium o user' });
        }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});
//todos los user
router.get('/', async (req, res) => {
    try {
        const users = await manager.getAll();
        const filteredUsers = users.map(user => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role
        }));
        res.status(200).json({ origin: config.SERVER, payload: filteredUsers });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});


router.get('/paginate/:page/:limit', async (req, res) => {
    try {
        const filter = { role: 'admin' };
        const options = { page: req.params.page, limit: req.params.limit, sort: { lastName: 1 } };
        const process = await manager.getPaginated(filter, options);

        res.status(200).send({ origin: config.SERVER, payload: process });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.post('/',verifyRequiredBody(['firstName','lastName','email','password']), async (req, res) => {
    try {
        const process = await manager.add(req.body);
        
        res.status(200).send({ origin: config.SERVER, payload: process });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const filter = { _id: req.params.id };
        const update = req.body;
        const options = { new: true };
        const process = await manager.update(filter, update, options);
        
        res.status(200).send({ origin: config.SERVER, payload: process });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});
//elimina los user despues de 2 dias sin coneccion
router.delete('/', async (req, res) => {
    try {
        const twoDaysAgo = moment().subtract(2, 'days').toDate(); // Cambia 'days' por 'minutes' para pruebas
        const inactiveUsers = await usersModel.find({ lastConnection: { $lt: twoDaysAgo } }).lean();

        if (inactiveUsers.length === 0) {
            return res.status(200).json({ message: 'No hay usuarios inactivos para eliminar.' });
        }

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: config.GMAIL_APP_USER,
                pass: config.GMAIL_APP_PASS,
            },
        });

        for (const user of inactiveUsers) {
            // Eliminar usuario
            await manager.delete({ _id: user._id });

            // Enviar correo de notificación
            await transporter.sendMail({
                to: user.email,
                from: `Sistema Coder <${config.GMAIL_APP_USER}>`,
                subject: 'Cuenta eliminada por inactividad',
                html: `<p>Estimado ${user.firstName},</p>
                       <p>Tu cuenta ha sido eliminada debido a la inactividad de más de 2 días.</p>`,
            });
        }

        res.status(200).json({ message: `Se eliminaron ${inactiveUsers.length} usuarios inactivos.` });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

//ruta para modificar el rol, eliminar user solo para admin y view de users

router.get('/admin',handlePolicies('admin'), async (req, res) => {
    try {
        // Verifica si el usuario es un administrador
        /* if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado: Solo los administradores pueden acceder a esta vista.' });
        } */

        const users = await manager.getAll();
        const filteredUsers = users.map(user => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            lastconnection: user.lastConnection
        }));
        console.log("user admin log ", filteredUsers);
        
        // Renderizar la vista de administración de usuarios
        res.render('users', { users: filteredUsers });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});


//eliminar user
router.delete('/:id', async (req, res) => {
    try {
        const filter = { _id: req.params.id };
        const process = await manager.delete(filter);

        res.status(200).send({ origin: config.SERVER, payload: process });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.get('/current', async (req, res) => {
    try {
        const userId = { _id: req.params.id }; // Asumiendo que tienes el ID del usuario en `req.user.id`
        const user = await manager.getById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/resetpassword', verifyRequiredBody(['email']), async (req, res) => {
    try {
        await manager.generateResetLink(req.body.email);
        res.status(200).send({ message: 'Reset link sent' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Ruta para resetear la contraseña
router.post('/resetpassword/:token', verifyRequiredBody(['newPassword']), async (req, res) => {
    try {
        await manager.resetPassword(req.params.token, req.body.newPassword);
        res.status(200).send({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

router.post('/premium/:uid', async (req, res) => {
    try {
        const user = await manager.getById(req.params.uid);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const requiredDocuments = ['Identificacion', 'Comprobante de domicilio', 'Comprobante de estado de cuenta']

        const uploadedDocuments = user.documents.map(doc => doc.name);
        const hasAllDocuments = requiredDocuments.every(doc => uploadedDocuments.includes(doc));

        if(!hasAllDocuments){
            return res.status(400).json({message: 'User has not uploaded all required documents'})
        }

        user.role = user.role === 'user' ? 'premium' : 'user';
        await user.save();

        res.status(200).send({ message: `User role updated to ${user.role}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// ruta para actualizar el rol del user en la view
/* router.put('/:id/role', async (req, res) => {

    try {
        const userId = req.params.id; // Obtén solo el ID
        const { role } = req.body; // Obtén el rol del cuerpo de la solicitud
        console.log('Rol a actualizar:', role);
        console.log('ID del usuario:', userId);

        // Verificar que el ID esté presente
        if (!userId) {
            return res.status(400).json({ message: 'Falta el ID del usuario' });
        }

        // Asegurarse de que el ID sea un ObjectId válido antes de usarlo
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID del usuario no válido' });
        }
        console.log('Filtro que se enviará:', { _id: userId }); // Imprime el filtro que se va a enviar
        console.log('Datos a actualizar:', { role });   
        const updatedUser = await manager.update({ userId }, { role });
        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Rol actualizado correctamente', user: updatedUser });
    }   catch (err) {
        console.error('Error al actualizar el rol:', err); // Agrega este log para depuración
        res.status(500).send({ message: err.message });
    }

});
 */


router.put('/role/:id', async (req, res) => {
    const { role } = req.body; // Obtenemos el rol del cuerpo de la solicitud
    const id = req.params.id; // Obtenemos el ID de los parámetros de la solicitud

    console.log('ID recibido:', id); // Para depuración
    console.log('Rol recibido:', role); // Para depuración

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'ID inválido' });
    }

    try {
        if (role !== 'user' && role !== 'premium' && role !== 'admin') {
            return res.status(400).send({ origin: config.SERVER, payload: null, error: 'Rol inválido' });
        }

        // Actualiza el usuario con el nuevo rol
        const updatedUser = await manager.update({ _id: id },{role: role}); // Usa el id correcto

        if (!updatedUser) {
            return res.status(404).send({ origin: config.SERVER, payload: null, error: 'Usuario no encontrado' });
        }

        res.status(200).send({ origin: config.SERVER, payload: updatedUser, message: 'Rol actualizado correctamente' });
    } catch (error) {
        console.log('Error al actualizar el rol del usuario', error);
        res.status(500).send({ origin: config.SERVER, payload: null, error: error.message });
    }
});



//subida de imagenes, archivos con multer
router.post('/:uid/documents', uploader.array('documents', 3), async (req,res)=>{
    try{

        const {uid} = req.params;
        const user = await manager.getById(uid);

        if(!user){
            return res.status(404).json({message: 'User not found'});
        }

        const uploadedFiles = req.files.map(file => ({
            name: file.originalname,
            reference: `${config.UPLOAD_DIR}/documents/${file.filename}`
        }));

        user.documents = user.documents.concat(uploadedFiles);
        await user.save();

        res.status(200).json({message: 'Documents uploaded successfully', documents: user.documents});
    } catch (error){
        res.status(500).json({ message: error.message });
    }
});

router.post('/profiles', uploader.array('profilesImages', 3), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send({ message: 'No files uploaded' });
        }
        
        const uploadedFiles = req.files.map(file => ({
            name: file.originalname,
            reference: `${config.UPLOAD_DIR}/profiles/${file.filename}`
        }));

        res.status(200).send({ status: 'success', message: 'Profile images uploaded', files: uploadedFiles });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
});

router.post('/products', uploader.array('productImages', 3), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send({ message: 'No files uploaded' });
        }
        
        const uploadedFiles = req.files.map(file => ({
            name: file.originalname,
            reference: `${config.UPLOAD_DIR}/products/${file.filename}`
        }));

        res.status(200).send({ status: 'success', message: 'Product images uploaded', files: uploadedFiles });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
});


export default router;