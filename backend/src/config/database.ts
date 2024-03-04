import mysql, { Pool, PoolConnection } from 'mysql2/promise';

const config: mysql.PoolOptions = {
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'secureauth',
    waitForConnections: true,
    connectionLimit: 0,
    queueLimit: 0,
};

const pool: Pool = mysql.createPool(config);

(async () => {
    try {
        const connection: PoolConnection = await pool.getConnection();
        console.log('Connected to MySQL database');

        connection.release();
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
})();

export default pool;