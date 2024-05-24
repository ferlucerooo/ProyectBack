import * as url from 'url';

const config = {
    /* PORT: 8080,
    DIRNAME: url.fileURLToPath(new URL('.', import.meta.url)),
    // Esta función tipo getter nos permite configurar dinámicamente
    // la propiedad UPLOAD_DIR en base al valor de otra propiedad (DIRNAME)
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` }, // Función getter
    //MONGODB_URI: 'mongodb://localhost:27017/coder-53160',
    MONGODB_URI: 'mongodb+srv://coder_53160:coder2024@clustercoder.sxqjiud.mongodb.net/coder_53160'
     */
    SERVER: 'local',
    PORT: 8080,
    // DIRNAME: url.fileURLToPath(new URL('.', import.meta.url)), // Linux / Mac
    DIRNAME: url.fileURLToPath(new URL('.', import.meta.url)), // Win
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` },
    // MONGODB_URI: 'mongodb://127.0.0.1:27017/coder_53160',
    MONGODB_URI: 'mongodb+srv://coder_53160:coder2024@clustercoder.sxqjiud.mongodb.net/coder_53160',
    MONGODB_ID_REGEX: /^[a-fA-F0-9]{24}$/
};


export default config;