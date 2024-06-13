import { Router } from "express";
import config from "../config.js";
import { isValidPassword, verifyRequiredBody, createHash } from "../utils.js";
import passport from "passport";
import initAuthStrategies from "../auth/passaport.strategies.js";
import usersManager from '../dao/usersManager.db.js'


const router = Router ();
const manager = new usersManager ();

initAuthStrategies();


/* const users = [
    {
        firstName: 'José',
        lastName: 'Perez',
        email: 'idux.net@gmail.com',
        password: 'abc123',
        role: 'admin'
    }
]; */

const adminAuth = (req, res, next) => {
    if (req.session.user.role !== 'admin') return res.status(403).send({ origin: config.SERVER, payload: 'Acceso no autorizado: se requiere nivel de admin' });

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


router.post('/register', verifyRequiredBody(['firstName', 'lastName', 'email', 'password']), async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const foundUser = await manager.getOne({ email: email });

        // Si NO se encuentra ya registrado el email, continuamos y creamos
        // un nuevo usuario standard (tipo user)
        if (!foundUser) {
            const process = await manager.add({ firstName, lastName, email, password: createHash(password)});
            res.status(200).send({ origin: config.SERVER, payload: process });
        } else {
            res.status(400).send({ origin: config.SERVER, payload: 'El email ya se encuentra registrado' });
        }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

/* router.post('/register', verifyRequiredBody(['firstName', 'lastName', 'email', 'password']), (req, res) => {
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
}); */

// login
router.post('/login',verifyRequiredBody(['email', 'password']), async (req, res) => {
    try {
    const { email, password } = req.body;
    const foundUser = await manager.getOne({ email: email });

    if (foundUser && isValidPassword(password, foundUser.password)) {
        // En lugar de armar req.session.user manualmente, aprovechamos el operador spread (...)
        // para quitar la password del objeto foundUser y utilizar lo demás
        const { password, ...filteredFoundUser } = foundUser;
        // req.session.user = { firstName: foundUser.firstName, lastName: foundUser.lastName, email: email, role: foundUser.role };
        req.session.user = filteredFoundUser;
        req.session.save(err => {
            if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });

            res.redirect('/profile');
        });
    } else {
        res.status(401).send({ origin: config.SERVER, payload: 'Datos de acceso no válidos' });
    }
} catch (err) {
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
}


    /* try {
        const { email, password } = req.body;
        const user = users.find(user => user.email === email && isValidPassword(password, user.password));

        if (!user) {
            return res.status(401).send({ origin: config.SERVER, payload: 'Datos de acceso no válidos' });
        }

        req.session.user = { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role };
        res.redirect('/api/products/products');
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    } */

/*     try {
        
        const { email, password } = req.body;
        
        const user = users.find(user => user.email === email && user.password === password);

        if (!user) {
            return res.status(401).send({ origin: config.SERVER, payload: 'Datos de acceso no válidos' });
        }
        
        req.session.user = { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role };
        
        
        res.redirect('/api/products/products')
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    } */
});


// login passport
router.post('/pplogin', verifyRequiredBody(['email', 'password']), passport.authenticate('login', { failureRedirect: `/login?error=${encodeURI('Usuario o clave no válidos')}`}), async (req, res) => {
    try {
        // Passport inyecta los datos del done en req.user
        req.session.user = req.user;
        req.session.save(err => {
            if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
        
            res.redirect('/profile');
        });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});
// login github que se encarga de redireccionar 
router.get('/ghlogin', passport.authenticate('ghlogin', {scope: ['user']}), async (req, res) => {
});

//login github
router.get('/ghlogincallback', passport.authenticate('ghlogin', {failureRedirect: `/login?error=${encodeURI('Error al identificar con Github')}`}), async (req, res) => {
    try {
        /* req.session.user = req.user // req.user es inyectado AUTOMATICAMENTE por Passport al parsear el done()
        req.session.save(err => {
            if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
        
            res.redirect('/profile');
        }); */
        if (req.user) {
            req.session.user = req.user;
            req.session.login_type = 'GitHub';
            console.log('GitHub user data:', req.user);
            req.session.save(err => {
                if (err) {
                    return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
                }
                res.redirect('/profile');
            });
        } else {
            res.redirect('/login');
        }
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

/* console.log(users); */


export default router;