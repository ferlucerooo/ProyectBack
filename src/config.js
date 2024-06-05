import * as url from 'url';
import path from 'path';

const config = {
    SERVER: 'atlas',
    PORT: 8080,
    // DIRNAME: url.fileURLToPath(new URL('.', import.meta.url)), // Linux / Mac
    DIRNAME: path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1')), // Win
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` },
    //MONGODB_URI: 'mongodb://localhost:27017/coder-53160'
    MONGODB_URI: 'mongodb+srv://ferlucero:coder1234@clustercoder.7pwbewf.mongodb.net/coder-53160',
    MONGODB_ID_REGEX: /^[a-fA-F0-9]{24}$/,
    SECRET: 'coder-53160-secret'
}

export default config;
