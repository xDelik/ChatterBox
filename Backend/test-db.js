require('dotenv').config();
const { sequelize } = require('./Source/Config/db');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connected to:', process.env.POSTGRES_DB);

        const [users] = await sequelize.query('SELECT * FROM "Users"');
        console.log('Users:', users);

        const [channels] = await sequelize.query('SELECT * FROM "Channels"');
        console.log('Channels:', channels);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sequelize.close();
    }
}

test();
