import usersModel from '../models/users.model.js';
import UserDTO from './userDTO.js';

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
        try {
            const user = await usersModel.findById(id).lean();
            return user ? new UserDTO(user) : null;
        } catch (err) {
            return err.message;
        };
    };

    getOne = async (filter) => {
        try {
            const user = await usersModel.findOne(filter).lean();
            return user ? new UserDTO(user) : null;
        } catch (err) {
            return err.message;
        };
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
            return await usersModel.create(newData);
        } catch (err) {
            return err.message;
        };
    };

    update = async (filter, update, options) => {
        try {
            const user = await usersModel.findOneAndUpdate(filter, update, options).lean();
            return user ? new UserDTO(user) : null;
        } catch (err) {
            return err.message;
        };
    };

    delete = async (filter) => {
        try {
            const user = await usersModel.findOneAndDelete(filter).lean();
            return user ? new UserDTO(user) : null;
        } catch (err) {
            return err.message;
        };
    };
}

export default UsersManager;