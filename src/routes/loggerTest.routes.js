import express from 'express';
import addLogger from '../services/logger.js'

const router = express.Router();

// Usa el middleware para agregar el logger a la request
router.use(addLogger);

router.get('/', (req, res) => {
   /*  req.logger.debug('This is a debug log');
    req.logger.http('This is an http log');
    req.logger.info('This is an info log');
    req.logger.warning('This is a warning log');
    req.logger.error('This is an error log');
    req.logger.fatal('This is a fatal log');

    res.send('Logs have been tested, check your console and files.'); */

    console.log(req.logger);
    // req.logger.fatal(`date: ${new Date().toDateString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url} | user: ${req.user.email}`);
    req.logger.fatal(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${req.url} | user: ${req.user}`);
    req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${req.url} | user: ${req.user}`);
    req.logger.warning(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${req.url} | user: ${req.user}`);
    req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${req.url} | user: ${req.user}`);
    req.logger.http(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${req.url} | user: ${req.user}`);
    req.logger.debug(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${req.url} | user: ${req.user}`);

    res.status(200).send({ status: 'OK', payload: '' });
});

export default router;