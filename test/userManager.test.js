import Assert from 'assert';
import mongoose from 'mongoose';
import UserManager from '../src/controllers/usersManager.db.js';

const connection = await mongoose.connect('mongodb://localhost:27017/coder-53160')
const manager = new UserManager();
const assert = Assert.strict;
let testUser = {
    firstName: 'Juan', lastName: 'Perez', email: 'jperez@gmail.com', password: 'abc445', role: "user" 
};

describe('Test DAO Users', function () {
    // Se ejecuta ANTES de comenzar el paquete de tests
    before( async function () {
        // esta funcion es para vaciar la collection antes de iniciar
       /*  mongoose.connection.collections.users_test.drop(); */

        /* testUser = await manager.add({
             firstName: 'Juan', lastName: 'Perez', email: 'jperez@gmail.com', password: 'abc445', role: "user" 
        })
 */
    });
    // Se ejecuta ANTES DE CADA test
    beforeEach(function () {
        this.timeout = 3000;
    });
    // Se ejecuta LUEGO de finalizar el paquete de tests
    after(function () {});
    // Se ejecuta LUEGO DE CADA test
    afterEach(function () {});

    it('get() debe retornar un array de usuarios', async function () {
        const result = await manager.getAll();
        assert.strictEqual(Array.isArray(result), true);
    });

    it('add() debe retornar un objeto con los datos del nuevo usuario', async function () {
        
        const result = await manager.add(testUser);
        assert.strictEqual(typeof result, 'object');
        /* assert.ok(result._id); */
        /* assert.deepStrictEqual(result, []); */
        assert.strictEqual(result.email, testUser.email, 'El email debe coincidir');
    });

    it('getOne() debe retornar un objeto coincidente con el criterio indicado', async function () {
        const result = await manager.getOne({ email: testUser.email });

        assert.strictEqual(typeof(result), 'object');
        assert.ok(result.email);
        assert.strictEqual(result.email, testUser.email);
    });

    it('update() debe retornar un objeto con los datos modificados', async function () {
        const modifiedMail = 'pepe@pepe.com';
        const result = await manager.update({ email: testUser.email }, { email: modifiedMail });

        assert.strictEqual(typeof(result), 'object');
        assert.ok(result.email);
        assert.strictEqual(result.email, modifiedMail);
    });

    it('delete() debe borrar definitivamente el documento indicado', async function () {
        const result = await manager.delete({ email: testUser.email });

        assert.strictEqual(typeof(result), 'object');
        assert.strictEqual(result.email.toString(), testUser.email.toString());
    });
});