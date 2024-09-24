import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userModel from '../models/users.model.js';
import nodemailer from 'nodemailer';
import { createHash } from '../services/utils.js';
import config from '../config.js';

class AuthService {
    constructor() {}

    forgotPassword = async (email) => {
        try {
            const user = await userModel.findOne({ email });

            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            const token = jwt.sign({ userId: user._id }, config.SECRET, { expiresIn: '1h' });

            this.sendResetEmail(user.email, `http://localhost:5050/api/sessions/auth/reset-password?token=${token}`);

            return 'Correo de restablecimiento de contraseña enviado';
        } catch (err) {
            return err.message;
        }
    };

    resetPassword = async (token, newPassword) => {
        try {
            const decoded = jwt.verify(token, config.SECRET);
            const user = await userModel.findById(decoded.userId);
    
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            const isSamePassword = await bcrypt.compare(newPassword, user.password);
    
            if (isSamePassword) {
                throw new Error('La nueva contraseña no puede ser igual a la anterior');
            }

            user.password = createHash(newPassword);
    
            await user.save();
    
            return { message: 'Contraseña restablecida exitosamente', success: true };;
        } catch (err) {
            return err.message;
        }
    };
    

    sendResetEmail = (to, link) => {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: config.GMAIL_APP_USER,
                pass: config.GMAIL_APP_PASS,
            },
        });

        const mailOptions = {
            from: config.GMAIL_APP_USER,
            to,
            subject: 'Restablecimiento de contraseña',
            html: `<p>Haga clic en el siguiente enlace para restablecer su contraseña: <a href="${link}">${link}</a></p>`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error al enviar el correo:', err);
            } else {
                console.log('Correo enviado:', info.response);
            }
        });
    };
}

export default AuthService;