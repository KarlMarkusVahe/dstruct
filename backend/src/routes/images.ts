import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/config';

const router = Router();

// TYPE: GET
// REQUIREMENT: NONE
// RETURN: RETURNS ALL ONLINE USERS
router.get('/pfp', async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await pool.getConnection();

        if(!req.session.user) {
            res.status(401).json({ message: 'User not logged in.' });
            return;
        }

        // incomplete route

        return res.status(200);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if(connection) {
            connection.release();
        }
    }
});


export default router;