import chai from 'chai';
import supertest from 'supertest';

const expect = chai.expect;
/**
 * Utilizamos el requester de supertest para poder realizar solicitudes
 * http, es decir, realizar los tests desde los propios endpoints
 */
const requester = supertest('http://localhost:8080');
const testUser = { first_name: 'Juan', last_name: 'Perez', email: 'jperez@gmail.com', password: 'abc445' };
let cookie = {};

describe('Test Integración Users', function () {

    it('POST /api/auth/register debe registrar un nuevo usuario', async function () {
        const response = await requester.post('/api/auth/register').send(testUser);
        const { statusCode, body } = response;

        console.log('Registro Response:', body);

        expect(statusCode).to.equal(200);
        expect(body.error).to.be.undefined;
        expect(body.payload).to.be.ok;
    });

    it('POST /api/auth/register NO debe volver a registrar el mismo mail', async function () {
        const response = await requester.post('/api/auth/register').send(testUser);
        const { statusCode, body } = response;

        console.log('Registro Duplicado Response:', body);

        expect(statusCode).to.equal(400);
        expect(body.error).to.be.ok;
        expect(body.payload).to.equal('El email ya se encuentra registrado');
    });

    it('POST /api/auth/login debe ingresar correctamente al usuario', async function () {
        const response = await requester.post('/api/auth/login').send(testUser);
        const { statusCode, headers } = response;

        console.log('Login Response:', response.body);

        const cookieData = headers['set-cookie'] ? headers['set-cookie'][0] : '';
        cookie = { name: cookieData.split('=')[0], value: cookieData.split('=')[1] };

        expect(statusCode).to.equal(200);
        expect(cookieData).to.be.ok;
        expect(cookie.name).to.equal('coderCookie');
        expect(cookie.value).to.be.ok;
    });

    it('GET /api/sessions/current debe retornar datos correctos de usuario', async function () {
        const response = await requester.get('/api/sessions/current').set('Cookie', [`${cookie.name}=${cookie.value}`]);
        const { statusCode, body } = response;

        console.log('Current Session Response:', body);

        expect(statusCode).to.equal(200);
        expect(body.payload).to.have.property('name');
        expect(body.payload).to.have.property('role');        
        expect(body.payload).to.have.property('email').and.to.equal(testUser.email);
    });
});