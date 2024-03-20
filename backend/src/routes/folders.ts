import bcrypt from 'bcrypt';
import { Request, Response, Router } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/config';
import pool from '../config/database';
import sendMail from '../helpers/mail';

const router = Router();

// TYPE: GET
// REQUIREMENT: NONE
// RETURN: RETURNS ALL FOLDERS FOR USER
router.get('/folders', async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await pool.getConnection();

        if(!req.session.user) {
            res.status(401).json({ message: 'User not logged in.' });
            return;
        }

        const sql_query = 'SELECT f.ID, f._ID, f.TITLE, f.CATEGORY FROM folders f LEFT JOIN folder_privileges fp ON f.ID = fp.FOLDER_ID WHERE (f.user_id = ? OR (fp.USER_ID = ? AND fp.READ_PRIVILEGE = TRUE))';
        const [rows] = await connection.query<RowDataPacket[]>(sql_query, [req.session.user.id, req.session.user.id]);

        return res.status(202).json({ message: 'Success.', data: rows});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if(connection) {
            connection.release();
        }
    }
});

// TYPE: PUT
// REQUIREMENT: NONE
// RETURN: RETURNS ALL FOLDERS FOR USER
router.put('/folders', async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const { _ID, title, category } = req.body;
        if(title.length <= 0)
        {
            res.status(401).json({ message: 'Invalid data.' });
            return;
        }

        if(!req.session.user) {
            res.status(401).json({ message: 'User not logged in.' });
            return;
        }

        const sql_query = 'INSERT INTO folders(_ID, user_id, title, category) VALUES(?, ?, ?, ?)';
        const [rows] = await connection.query<RowDataPacket[]>(sql_query, [_ID || null, req.session.user.id, title, category || 'ÜLDINE']);

        if(rows.length <= 0) {
            throw Error('Failed inserting folder');
        }

        return res.status(202).json({ message: 'Success.', data: rows });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if(connection) {
            connection.release();
        }
    }
});

// TYPE: DELETE
// REQUIREMENT: NONE
// RETURN: RETURNS ALL FOLDERS FOR USER
router.delete('/folder/:id', async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await pool.getConnection();

        if(!req.session.user) {
            res.status(401).json({ message: 'User not logged in.' });
            return;
        }

        const folder_id = req.params.id;

        const privilege_query = 'SELECT fp.DELETE_PRIVILEGE, f.user_id FROM folders f JOIN folder_privileges fp ON f.ID = fp.FOLDER_ID WHERE  fp.USER_ID = ?';
        const [privilege_rows] = await connection.query<RowDataPacket[]>(privilege_query, [req.session.user.id]);

        if(privilege_rows.length <= 0)
        {
            res.status(404).json({ message: 'Invalid data.' });
            return;
        }

        if(privilege_rows[0].OWNER_ID != req.session.user.id || !privilege_rows[0].DELETE_PRIVILEGE)
        {
            res.status(404).json({ message: 'Insufficient privileges.' });
            return;
        }

        const delete_folders_query = 'DELETE FROM folders WHERE ID = ?';
        await connection.query<RowDataPacket[]>(delete_folders_query, [folder_id]);
        const delete_privileges_query = 'DELETE FROM folder_privileges WHERE FOLDER_ID = ?';
        await connection.query<RowDataPacket[]>(delete_privileges_query, [folder_id]);

        return res.status(202).json({ message: 'Success.' });
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