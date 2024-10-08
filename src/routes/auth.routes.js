import { Router } from "express";
import config from "../config.js";
import { isValidPassword, verifyRequiredBody, createHash, createToken, verifyToken, handlePolicies } from "../services/utils.js";
import passport from "passport";
import initAuthStrategies, { passportCall }  from "../auth/passaport.strategies.js";
import usersManager from '../controllers/usersManager.db.js';



const router = Router ();
const manager = new usersManager ();

initAuthStrategies();


const adminAuth = (req, res, next) => {
    if (req.session.user.role !== 'admin') return res.status(403).send({ origin: config.SERVER, payload: 'Acceso no autorizado: se requiere nivel de admin' });

    next();
}

const verifyAuthorization = role => {
    return async (req, res, next) => {
        if (!req.user) return res.status(401).send({ origin: config.SERVER, payload: 'Usuario no autenticado' });
        if (req.user.role !== role) return res.status(403).send({ origin: config.SERVER, payload: 'No tiene permisos para acceder al recurso' });
        
        next();
    }
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

// Endpoint temporal para hashear claves de prueba
router.get('/hash/:password', async (req, res) => {
    res.status(200).send({ origin: config.SERVER, payload: createHash(req.params.password) });
});

router.post('/register', verifyRequiredBody(['firstName', 'lastName', 'email', 'password']), async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        console.log("Email recibido:", email);
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
        console.error('Error during registration:', err);
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});


// login

router.post('/login', verifyRequiredBody(['email', 'password']), async (req, res) => {
    try {
        const { email, password } = req.body;
        const foundUser = await manager.getOne({ email: email });
        //console.log('Usuario encontrado:', foundUser);

        if (foundUser && isValidPassword(password, foundUser.password)) {
            // Actualiza el último inicio de sesión
            foundUser.lastConnection = new Date();
            await manager.update({ email: foundUser.email }, { lastConnection: foundUser.lastConnection });

             // Establece la sesión del usuario
             req.session.user = {
                id: foundUser.id,
                firstName: foundUser.firstName,
                lastName: foundUser.lastName,
                email: foundUser.email,
                role: foundUser.role,
                lastConnection: foundUser.lastConnection
            };
            
            req.session.save((err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al guardar la sesión' });
                }

                // Redirige a la vista de productos
                res.redirect('/api/products/products');
            });
           /*  const { password: userPassword, ...userData } = foundUser;
            const token = createToken(userData, '1h'); */
           
            console.log('Sesión establecida:', req.session.user);
           
        } else {
            res.status(401).json({ error: 'Datos de acceso no válidos' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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

// Endpoint autenticación con Passport contra base de datos propia y jwt
router.post('/jwtlogin', verifyRequiredBody(['email', 'password']), passport.authenticate('login', { failureRedirect: `/login?error=${encodeURI('Usuario o clave no válidos')}`}), async (req, res) => {
    try {
        // Passport inyecta los datos del done en req.user
        // Creamos un token (una nueva credencial) para enviarle al usuario
        const token = createToken(req.user, '1h');
        // Notificamos al navegador para que almacene el token en una cookie
        res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 60 * 60 * 1000, httpOnly: true });
        res.status(200).send({ origin: config.SERVER, payload: 'Usuario autenticado' });
        // También podemos retornar el token en la respuesta, en este caso el cliente tendrá
        // que almacenar manualmente el token.
        // res.status(200).send({ origin: config.SERVER, payload: 'Usuario autenticado', token: token });
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



/* router.get('/ghlogincallback', passport.authenticate('ghlogin', {failureRedirect: `/login?error=${encodeURI('Error al identificar con Github')}`}), async (req, res) => {
    
    try {
        if (req.user) {
            // Verifica si el usuario existe en la base de datos
            const foundUser = await manager.getOne({ email: req.user.email });

            if (foundUser) {
                // Actualiza el último inicio de sesión
                foundUser.lastConnection = new Date();
                await manager.update({ email: foundUser.email }, { lastConnection: foundUser.lastConnection });

                // Establece la sesión del usuario
                req.session.user = {
                    id: foundUser.id,
                    firstName: foundUser.firstName,
                    lastName: foundUser.lastName,
                    email: foundUser.email,
                    role: foundUser.role
                };

                req.session.login_type = 'GitHub'; // Indica que el login es con GitHub

                console.log('GitHub user data:', req.user);

                // Guarda la sesión antes de redirigir
                req.session.save(err => {
                    if (err) {
                        return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
                    }
                    res.redirect('/api/products/products');
                });
            } else {
                // Si no se encuentra el usuario, redirige al login
                res.redirect('/login');
            }
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
}); */

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

// Ejemplo autenticación y autorización manual de admin
router.get('/admin', handlePolicies(['admin', 'premium']), async (req, res) => {
    try {
        res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido ADMIN!' });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});
//Ejemplo autenticación y autorización de admin vía Passport
router.get('/ppadmin', passportCall('jwtlogin'), verifyAuthorization('admin'), async (req, res) => {
    try {
        res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido ADMIN!' });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.get('/current', async (req, res) => {
    try {
        const token = req.cookies[`${config.APP_NAME}_cookie`];
        if (!token) return res.status(401).send({ origin: config.SERVER, payload: 'No autenticado' });

        const user = verifyToken(token);
        res.status(200).send({ origin: config.SERVER, payload: user });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

export default router;