import Assert from 'assert';
import mongoose from 'mongoose';
import UserManager from '../src/controllers/usersManager.db';

const connection = await mongoose.connect('mongodb://localhost:27017/coder-53160')
const manager = new UserManager();
const assert = Assert.strict;
const testUser = { first_name: 'Juan', last_name: 'Perez', email: 'jperez@gmail.com', password: 'abc445' };

describe('Test DAO Users', function () {
    // Se ejecuta ANTES de comenzar el paquete de tests
    before(function () {
        // esta funcion es para vaciar la collection antes de iniciar
        mongoose.connection.collections.users_test.drop();
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

    it('save() debe retornar un objeto con los datos del nuevo usuario', async function () {
        const result = await manager.add(testUser);
        assert.strictEqual(typeof(result), 'object');
        assert.ok(result._id);
        assert.deepStrictEqual(result, []);
    });

    it('getBy() debe retornar un objeto coincidente con el criterio indicado', async function () {
        const result = await manager.getOne({ email: testUser.email });
        
        // Aprovechamos a guardar el id del usuario de prueba que acabamos de crear
        testUser._id = result._id;

        assert.strictEqual(typeof(result), 'object');
        assert.ok(result._id);
        assert.deepStrictEqual(result.email, testUser.email);
    });

    it('update() debe retornar un objeto con los datos modificados', async function () {
        const modifiedMail = 'pepe@pepe.com';
        const result = await manager.update({ _id: testUser._id }, { email: modifiedMail });

        assert.strictEqual(typeof(result), 'object');
        assert.ok(result._id);
        assert.strictEqual(result.email, modifiedMail);
    });

    it('delete() debe borrar definitivamente el documento indicado', async function () {
        const result = await manager.delete({ _id: testUser._id });

        assert.strictEqual(typeof(result), 'object');
        assert.deepStrictEqual(result._id, testUser._id);
    });
});