import winston from "winston";

import config from "../config.js";

const customLevels = {
    levels: {
        debug: 0,
        http: 1,
        info: 2,
        warning: 3,
        error: 4,
        fatal: 5
      },
      colors: {
        debug: 'blue',
        http: 'magenta',
        info: 'green',
        warning: 'yellow',
        error: 'red',
        fatal: 'cyan'
      }
};
winston.addColors(customLevels.colors);

/* const devLogger = winston.createLogger({
    transports: [
        new winston.transports.Console({ level: 'debug' })
    ]
}); */
const devLogger = winston.createLogger({
    levels: customLevels.levels,
    level: 'debug', // Log a partir de debug en desarrollo
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
    transports: [
      new winston.transports.Console()
    ]
  });

  const prodLogger = winston.createLogger({
    levels: customLevels.levels,
    level: 'info', // Log a partir de info en producción
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'errors.log', level: 'error' }) // Guarda logs de error y superiores en archivo
    ]
  });

/* const prodLogger = winston.createLogger({
    transports: [
        new winston.transports.Console({ level: 'debug' }),
        new winston.transports.File({ level: 'info', filename: `${config.DIRNAME}/logs/errors.log`})
    ]
}); */

const addLogger = (req, res, next) => {
    //req.logger = devLogger;
    req.logger = config.MODE === 'dev' ? devLogger : prodLogger;
    req.logger.http(`${new Date().toDateString()} ${req.method} ${req.url}`);
    next();
}

export default addLogger;