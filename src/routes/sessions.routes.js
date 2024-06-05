import { Router } from "express";

import config from "../config.js";

const router = Router ();


const users = [
    {
        firstName: 'José',
        lastName: 'Perez',
        email: 'idux.net@gmail.com',
        password: 'abc123',
        role: 'admin'
    }
];

const adminAuth = (req, res, next) => {
    if (req.session.user.role !== 'admin') return res.status(401).send({ origin: config.SERVER, payload: 'Acceso no autorizado: se requiere nivel de admin' });

    next();
}




router.get('/counter', async (req, res) => {
    try {
        // Si hay un counter en req.session, lo incrementamos, sino lo creamos con valor 1
        if (req.session.counter) {
            req.session.counter++;
            res.status(200).send({ origin: config.SERVER, payload: `Visitas: ${req.session.counter}` });
        } else {
            req.session.counter = 1;
            res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido, es tu primer visita!' });
        }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.get('/private', adminAuth, async (req, res) => {
    try {
        res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido ADMIN!' });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});



// login
router.post('/login', async (req, res) => {
    try {
        
        const { email, password } = req.body;
        console.log('Body recibido:', req.body);
        console.log('Email recibido:', email);
        console.log('Password recibido:', password);
        
        const user = users.find(user => user.email === email && user.password === password);

        if (!user) {
            return res.status(401).send({ origin: config.SERVER, payload: 'Datos de acceso no válidos' });
        }
        
        req.session.user = { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role };
        
        /* console.log(req.session.user); */
        /* res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido!' }); */
        // res.redirect nos permite redireccionar a una plantilla en lugar de devolver un mensaje
        /* res.redirect('/profile'); */ // redireccionar a la vista de products para el entregable
        
        res.redirect('/api/products/products')
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.get('/logout', async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) return res.status(500).send({ origin: config.SERVER, payload: 'Error al ejecutar logout', error: err });
            /* res.status(200).send({ origin: config.SERVER, payload: 'Usuario desconectado' }); */
            res.redirect('/login');
        });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.post('/register', (req, res) => {
    try {
        const { firstName, lastName, email, gender, password } = req.body;
        console.log('Datos recibidos para registro:', req.body);

        // Validar que todos los campos estén presentes
        if (!firstName || !lastName || !email || !gender || !password) {
            console.error('Todos los campos son obligatorios.');
            return res.render('register', { msg: 'Todos los campos son obligatorios' });
        }

        // Comprobar si el email ya está registrado
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            console.error('El email ya está registrado:', email);
            return res.render('register', { msg: 'El email ya está registrado' });
        }

        // Crear nuevo usuario y agregarlo a la "base de datos"
        const newUser = { firstName, lastName, email, gender, password, role: 'usuario' };
        users.push(newUser);

        console.log('Usuario registrado exitosamente:', newUser);

        // Iniciar sesión del usuario automáticamente después del registro
        req.session.user = { firstName, lastName, email, role: 'usuario' };

        // Redirigir a la vista de productos
        res.redirect('/api/products/products');
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).send('Error al registrar el usuario. Por favor, inténtalo de nuevo más tarde.');
    }
});


console.log(users);


export default router;