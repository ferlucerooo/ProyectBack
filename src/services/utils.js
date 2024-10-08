import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config, {errorsDictionary} from '../config.js';
import CustomError from './errors.js';

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (passwordToVerify, storedHash) => bcrypt.compareSync(passwordToVerify, storedHash);

export const createToken = (payload, duration) => jwt.sign(payload, config.SECRET, { expiresIn: duration });

export const verifyToken = (req, res, next) => {
    // Header Authorization: Bearer <token>
    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1]: undefined;
    const cookieToken = req.cookies && req.cookies[`${config.APP_NAME}_cookie`] ? req.cookies[`${config.APP_NAME}_cookie`]: undefined;
    const queryToken = req.query.access_token ? req.query.access_token: undefined;
    const receivedToken = headerToken || cookieToken || queryToken;

    if (!receivedToken) return res.status(401).send({ origin: config.SERVER, payload: 'Se requiere token' });

    jwt.verify(receivedToken, config.SECRET, (err, payload) => {
        if (err) return res.status(403).send({ origin: config.SERVER, payload: 'Token no válido' });
        req.user = payload;
        next();
    });
}

export const verifyRequiredBody = (requiredFields) => {
    return (req, res, next) => {
        const allOk = requiredFields.every(field => 
            req.body.hasOwnProperty(field) && req.body[field] !== '' && req.body[field] !== null && req.body[field] !== undefined
        );
        
        /* if (!allOk) return res.status(400).send({ origin: config.SERVER, payload: 'Faltan propiedades', requiredFields }); */
        if (!allOk) throw new CustomError(errorsDictionary.FEW_PARAMETERS);
  
      next();
    };
};


export const verifyAllowedBody = (allowedFields) => {
    return (req, res, next) => {
        req.body = allowedFields.reduce((filteredBody, key) => {
            if (req.body.hasOwnProperty(key) && req.body[key] !== '') filteredBody[key] = req.body[key];
            return filteredBody;
          }, {});
        
        next();
    };
};

export const verifyMongoDBId = (id) => {
    return (req, res, next) => {
        if (!config.MONGODB_ID_REGEX.test(req.params.id)) {
            return res.status(400).send({ origin: config.SERVER, payload: null, error: 'Id no válido' });
        }
    
        next();
    }
}

export const verifyDbConn = (req, res, next) => {
    MongoSingleton.getInstance();
    next();
}

export const handlePolicies = policies => {
    return async (req, res, next) => {
        console.log('Sesión en middleware:', req.session.user);
        if (!req.session.user) return res.status(401).send({ origin: config.SERVER, payload: 'Usuario no autenticado' });
        if (policies.includes(req.session.user.role)) return next();
        res.status(403).send({ origin: config.SERVER, payload: 'No tiene permisos para acceder al recurso' });
    }
}

export const errorsHandler = (error, req, res, next) => {
    console.log('ingresa');
    let customErr = errorsDictionary[0];
    for (const key in errorsDictionary) {
        if (errorsDictionary[key].code === error.type.code) customErr = errorsDictionary[key];
    }
    
    return res.status(customErr.status).send({ origin: config.SERVER, payload: '', error: customErr.message });
}

export function authMiddleware(req, res, next) {
    console.log('Middleware ejecutado. Usuario en sesión:', req.session.user);

    // Verifica si existe la sesión del usuario
    if (req.session && req.session.user) {
        req.user = req.session.user;  // Asigna el usuario autenticado a req.user
        return next();
    }

    console.log('Sesión no válida o expirada');
    res.status(401).json({ error: 'No autorizado' });
}
