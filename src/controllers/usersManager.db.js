import usersModel from '../models/users.model.js';
import UserDTO from './userDTO.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

class UsersManager {
    constructor() {
    }

    getAll = async (limit = 0) => {
        try {
            const users = limit === 0 ? await usersModel.find().lean() : await usersModel.find().limit(limit).lean();
            return users.map(user => new UserDTO(user));
        } catch (err) {
            return err.message;
        };
    };

    getById = async (id) => {
        /* try {
            const user = await usersModel.findById(id).lean();
            return user ? new UserDTO(user) : null;
        } catch (err) {
            return err.message;
        }; */
        try {
            const user = await usersModel.findById(id).lean();
            if (!user) throw new Error('Usuario no encontrado');  // Lanza un error si el usuario no se encuentra
            return new UserDTO(user);
        } catch (err) {
            throw new Error(err.message);  // Maneja errores correctamente
        }

    };

    getOne = async (filter) => {
        /* try {
            const user = await usersModel.findOne(filter).lean();
            if (user) {
                console.log('Usuario desde DB:', user); // Verifica qué campos está devolviendo la DB
                return new UserDTO(user);
            }
            return null; // Retorna null si no se encuentra el usuario
        } catch (err) {
            return err.message;
        }; */
        try {
            const user = await usersModel.findOne(filter).lean();
            if (!user) throw new Error('Usuario no encontrado');
            return new UserDTO(user);
        } catch (err) {
            throw err.message;
        }


    };

    getAggregated = async (match, group, sort) => {
        try {
            return await usersModel.aggregate([
                { $match: match },
                { $group: group },
                { $sort: sort }
            ]);
        } catch (err) {
            return err.message;
        };
    };

    getPaginated = async (filter, options) => {
        try {
            const result = await usersModel.paginate(filter, options);
            result.docs = result.docs.map(user => new UserDTO(user));
            return result;
        } catch (err) {
            return err.message;
        };
    };

    add = async (newData) => {

        try {
            const createdUser = await usersModel.create(newData);
            return new UserDTO(createdUser);  // Asegúrate de retornar un objeto de usuario
        } catch (err) {
            throw new Error(err.message); 
        }
        /* try {
            return await usersModel.create(newData);
        } catch (err) {
            return err.message;
        }; */
    };

    update = async (filter, update, options) => {
       /*  try {
            const user = await usersModel.findOneAndUpdate(filter, update, options).lean();
            return user ? new UserDTO(user) : null;
        } catch (err) {
            return err.message;
        }; */
        try {
            const user = await usersModel.findOneAndUpdate(filter, update, { new: true }).lean();
            if (!user) throw new Error('Usuario no encontrado');
            return new UserDTO(user);
        } catch (err) {
            throw err.message;
        }


    };

    delete = async (filter) => {
        /* try {
            const user = await usersModel.findOneAndDelete(filter).lean();
            return user ? new UserDTO(user) : null;
        } catch (err) {
            return err.message;
        }; */

        try {
            const user = await usersModel.findOneAndDelete(filter).lean();
            if (!user) throw new Error('Usuario no encontrado');
            return new UserDTO(user);
        } catch (err) {
            throw err.message;
        }
    };

    generateResetLink = async (email) => {
        const user = await usersModel.findOne({ email });
        if (!user) throw new CustomError(errorsDictionary.ID_NOT_FOUND);

        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hora
        await user.save();

        const resetLink = `${config.SERVER}/resetpassword/${token}`;

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: config.GMAIL_APP_USER,
                pass: config.GMAIL_APP_PASS,
            },
        });

        try {
            await transporter.sendMail({
                to: email,
                from: `Sistema Coder <${config.GMAIL_APP_USER}>`,
                subject: 'Password Reset',
                to: 'ferlucero2210@gmail.com',
                html: `<p>You requested a password reset</p>
                       <p>Click this <a href="${resetLink}">link</a> to set a new password.</p>`
            });
        } catch (err) {
            throw new CustomError(errorsDictionary.EMAIL_SEND_ERROR);
        }

        return true;
    };

    resetPassword = async (token, newPassword) => {
        const user = await usersModel.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
        if (!user) throw new CustomError(errorsDictionary.TOKEN_INVALID);

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) throw new CustomError(errorsDictionary.SAME_PASSWORD_ERROR);

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        return true;
    };
    async update(filter, update) {
        try {
            // Utiliza el método de Mongoose `findOneAndUpdate` para actualizar un documento
            const updatedUser = await UserModel.findOneAndUpdate(filter, update, { new: true });
            return updatedUser;
        } catch (error) {
            throw new Error(`Error al actualizar el usuario: ${error.message}`);
        }
    }
}


export default UsersManager;