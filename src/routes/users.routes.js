import { Router } from 'express';

import config from '../config.js';
import UsersManager from '../controllers/usersManager.db.js';
import { verifyRequiredBody, verifyToken, handlePolicies } from '../services/utils.js';

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

        user.role = user.role === 'user' ? 'premium' : 'user';
        await user.save();

        res.status(200).send({ message: `User role updated to ${user.role}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/role/:id', verifyToken, handlePolicies('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (role !== 'user' && role !== 'premium') {
            return res.status(400).send({ origin: config.SERVER, payload: null, error: 'Rol inválido' });
        }

        const updatedUser = await manager.update({ _id: id }, { role });

        if (!updatedUser) {
            return res.status(404).send({ origin: config.SERVER, payload: null, error: 'Usuario no encontrado' });
        }

        res.status(200).send({ origin: config.SERVER, payload: updatedUser });
    } catch (error) {
        console.log('Error al actualizar el rol del usuario', error);
        res.status(500).send({ origin: config.SERVER, payload: null, error: error.message });
    }
});
export default router;