import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/config';

const router = Router();

// TYPE: GET
// REQUIREMENT: LOGGED IN
// RETURN: ALL FOLDERS ORGANIZED
router.get('/folders', async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await pool.getConnection();

        if(!req.session.user) {
            res.status(401).json({ message: 'User not logged in.' });
            return;
        }

        const sql_query = 'SELECT ID, _ID, title, category FROM folders WHERE user_id=?';
        const [rows] = await connection.query<RowDataPacket[]>(sql_query, [req.session.user.id]);

        const results = [];

        rows.forEach(row => {
            if (row._ID === null) {
                const folderObject = {
                    ID: row.ID,
                    title: row.title,
                    category: row.category,
                    subfolders: []
                };

                const subfolders = rows.filter(subfolder => subfolder._ID === row.ID);

                subfolders.forEach(subfolder => {
                    const subfolderObject = {
                        ID: subfolder.ID,
                        _ID: subfolder._ID,
                        title: subfolder.title,
                        category: subfolder.category,
                        subfolders: []
                    };

                    const subSubfolders = rows.filter(subSubfolder => subSubfolder._ID === subfolder.ID);

                    subSubfolders.forEach(subSubfolder => {
                        const subSubfolderObject = {
                            ID: subSubfolder.ID,
                            title: subSubfolder.title,
                            category: subSubfolder.category,
                            subfolders: []
                        };

                        subfolderObject.subfolders.push(subSubfolderObject);
                    });

                    folderObject.subfolders.push(subfolderObject);
                });

                results.push(folderObject);
            }
        });

        return res.status(200).json(results);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if(connection) {
            connection.release();
        }
    }
});

// TYPE: GET
// REQUIREMENT: LOGGED IN
// RETURN: FOLDER AND ITS SUBFOLDERS
router.get('/folders/:id', async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await pool.getConnection();

        if(!req.session.user) {
            res.status(401).json({ message: 'User not logged in.' });
            return;
        }

        const folder_id = req.params.id;

        const sql_query = 'SELECT ID, _ID, title, category FROM folders WHERE user_id=? AND (ID=? OR _ID=?)';
        const [rows] = await connection.query<RowDataPacket[]>(sql_query, [req.session.user.id, folder_id, folder_id]);

        const results = [];

       rows.forEach(row => {
            const folderObject = {
                ID: row.ID,
                _ID: row._ID,
                title: row.title,
                category: row.category,
                subfolders: []
            };

            
       });

        return res.status(200).json(results);
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