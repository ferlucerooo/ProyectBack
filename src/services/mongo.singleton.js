import mongoose from 'mongoose';
import config from '../config.js';

export default class MongoSingleton {
    static #instance;

    constructor() {
        this.connect();
    }
    
    async connect() {
        //await mongoose.connect(config.MONGODB_URI);
        try {
            await mongoose.connect(config.MONGODB_URI);
        } catch (error) {
            //console.error('Error al conectar a la base de datos:', error);
            throw error; // Propaga el error si es necesario
        }
    }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new MongoSingleton();
            console.log('Conexión bbdd CREADA');
        } else {
            console.log('Conexión bbdd RECUPERADA');
        }

        return this.#instance;
    }
}