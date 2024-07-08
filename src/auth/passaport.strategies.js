import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2'
import UsersManager from '../dao/usersManager.db.js';
import jwt from 'passport-jwt';

import config from '../config.js';
import { isValidPassword } from '../utils.js';

const jwtStrategy = jwt.Strategy;
const jwtExtractor = jwt.ExtractJwt;

const localStrategy = local.Strategy;
const manager = new UsersManager();

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) token = req.cookies[`${config.APP_NAME}_cookie`];
    
    return token;
}

const initAuthStrategies = () => {
    passport.use('login', new localStrategy(
        {passReqToCallback: true, usernameField: 'email'},
        async (req, username, password, done) => {
            try {
                const foundUser = await manager.getOne({ email: username });

                if (foundUser && isValidPassword(password, foundUser.password)) {
                    const { password, ...filteredFoundUser } = foundUser;
                    return done(null, filteredFoundUser);
                } else {
                    return done(null, false);
                }
            } catch (err) {
                return done(err, false);
            }
        }
    ));

    passport.use('ghlogin', new GitHubStrategy(
        {
            clientID: config.GITHUB_CLIENT_ID,
            clientSecret: config.GITHUB_CLIENT_SECRET,
            callbackURL: config.GITHUB_CALLBACK_URL,
            scope: ['user:email']
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                const emailsList = profile.emails || null;
                let email = profile._json?.email || null;

                if (!emailsList && !email) {
                    const response = await fetch('https://api.github.com/user/emails', {
                        headers: {
                            'Authorization': `token ${accessToken}`,
                            'User-Agent': config.APP_NAME
                        }
                    });
                    const emails = await response.json();
                    email = emails.filter(email => email.verified).map(email => ({ value: email.email }));
                }
                
                if (email) {
                    const foundUser = await manager.getOne({ email: emailsList[0] || email });

                    if (!foundUser) {
                        const user = {
                            firstName: profile._json.name.split(' ')[0],
                            lastName: profile._json.name.split(' ')[1],
                            email: email,
                            password: 'none' // No lo dejamos vacío porque en el modelo está requerido
                        }

                        const process = await manager.add(user);

                        return done(null, process);
                    } else {
                        return done(null, foundUser);
                    }
                } else {
                    return done(new Error('Faltan datos de perfil, email no público'), null);
                }
            } catch (err) {
                return done(err, false);
            }
        }
    ));

/* 
    passport.use('ghlogin', new GitHubStrategy(
        {
            clientID: config.GITHUB_CLIENT_ID,
            clientSecret: config.GITHUB_CLIENT_SECRET,
            callbackURL: config.GITHUB_CALLBACK_URL
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                // Si passport llega hasta acá, es porque la autenticación en Github
                // ha sido correcta, tendremos un profile disponible
                const email = profile._json?.email || null;
                
                // Necesitamos que en el profile haya un email
                if (email) {
                    // Tratamos de ubicar en NUESTRA base de datos un usuario
                    // con ese email, si no está lo creamos y lo devolvemos,
                    // si ya existe retornamos directamente esos datos
                    const foundUser = await manager.getOne({ email: email });

                    if (!foundUser) {
                        const user = {
                            firstName: profile._json.name.split(' ')[0],
                            lastName: profile._json.name.split(' ')[1],
                            email: email,
                            password: 'none'
                        }

                        const process = await manager.add(user);

                        return done(null, process);
                    } else {
                        return done(null, foundUser);
                    }
                } else {
                    return done(new Error('Faltan datos de perfil'), null);
                }
            } catch (err) {
                return done(err, false);
            }
        }
    ));
 */
    passport.use('register', new localStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, email, password, done) => {
            try {
                const existingUser = await manager.getOne({ email });
                if (existingUser) {
                    return done(null, false, { message: 'El email ya está registrado' });
                }

                const hashedPassword = createHash(password);
                const newUser = { ...req.body, email, password: hashedPassword };
                const createdUser = await manager.add(newUser);

                done(null, createdUser);
            } catch (error) {
                done(error);
            }
        }
    ));

    // Estrategia para verificación de token vía cookie
    passport.use('jwtlogin', new jwtStrategy(
        {
            // Aquí llamamos al extractor de cookie
            jwtFromRequest: jwtExtractor.fromExtractors([cookieExtractor]),
            secretOrKey: config.SECRET
        },
        async (jwt_payload, done) => {
            try {
                return done(null, jwt_payload);
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user);
    });
        
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
}

export const passportCall = strategy => {
    return async (req, res, next) => {
        passport.authenticate(strategy, { session: false }, function (err, user, info) {
            if (err) return next(err);
            // if (!user) return res.status(401).send({ origin: config.SERVER, payload: null, error: info.messages ? info.messages : info.toString() });
            if (!user) return res.status(401).send({ origin: config.SERVER, payload: null, error: 'Usuario no autenticado' });

            req.user = user;
            next();
        })(req, res, next);
    }
};

export default initAuthStrategies;