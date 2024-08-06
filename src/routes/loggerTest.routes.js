import express from 'express';
import addLogger from '../services/logger.js'

const router = express.Router();

// Usa el middleware para agregar el logger a la request
router.use(addLogger);

router.get('/', (req, res) => {
    req.logger.debug('This is a debug log');
    req.logger.http('This is an http log');
    req.logger.info('This is an info log');
    req.logger.warning('This is a warning log');
    req.logger.error('This is an error log');
    req.logger.fatal('This is a fatal log');

    res.send('Logs have been tested, check your console and files.');
});

export default router;