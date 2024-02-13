import bcrypt from 'bcrypt';
import { Request, Response, Router } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/config';
import pool from '../config/database';
import sendMail from '../helpers/mail';

const router = Router();

// todo: server reset = verifiedQueue wiped fix (file, db)
const verifiedQueue = new Map<number, { token: string, expiration: Date }>();
const active_users = new Map<number, { username: string, picture: string}>();

async function clearExpiredTokens() {
    setTimeout(() => {
        for (const [key, value] of verifiedQueue.entries()) {
            if (value.expiration.getTime() < Date.now()) {
                verifiedQueue.delete(key);
            }
        }
    }, 60 * 60 * 1000 * 3);
}

// TYPE: GET
// REQUIREMENT: NONE
// RETURN: RETURNS ALL ONLINE USERS
router.get('/users', async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await pool.getConnection();

        if(!req.session.user) {
            res.status(401).json({ message: 'User not logged in.' });
            return;
        }

        if(req.session.user.rank === 1) { // rank 1 = User
            res.status(401).json({ message: 'Not enough privileges.' });
            return;
        }

        const sql_query = 'SELECT username, picture FROM users WHERE (SELECT uid FROM active_users);';
        const [rows] = await connection.query(sql_query);

        return res.status(200).json({ message: 'Success.', data: rows });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if(connection) {
            connection.release();
        }
    }
});

function get_token(toFindToken : string) {
    for(const [key, value] of verifiedQueue) {
        if(value.token === toFindToken) {
            return { key, value};
        }
    }
    return null;
}

// TYPE: GET
// REQUIREMENT: NONE
// RETURN: VERIFY ACCOUNT STATUS
router.get('/verify/:token', async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const token = req.params.token;

        // added function get_token to lower code count inside route
        const item = get_token(token);
        if(!item) {
            res.status(404).json({ message: 'Token not found.' });
            return;
        }

        // sanity check because we do not filter tokens automatically
        if (item.value.expiration.getTime() < Date.now()) {
            verifiedQueue.delete(item.key);
            // new token/link is generated from /login route
            res.status(404).json({ message: 'Token expired.' });
            return;
        }

        const sql_query = 'UPDATE users SET verified=1 WHERE uid=?';
        const [rows] = await connection.query<RowDataPacket[]>(sql_query, [item.key]);

        // should never be true
        if(!rows || rows.affectedRows === 0) {
            res.status(500).json({ message: 'User not found.' });
            console.warn(`Token exists but user does not exist. ${item}`);
            return;
        }

        // delete the token from the Map
        verifiedQueue.delete(item.key);

        res.status(200).json({ message: 'Account activated.' });
        return;
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if(connection) {
            connection.release();
        }
    }
});

router.post('/verify', async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const token = req.params.token;

        // added function (get_token) to lower code count inside route
        const item = get_token(token);
        if(!item) {
            res.status(404).json({ message: 'Token not found.' });
            return;
        }

        // sanity check because we do not filter tokens automatically
        if (item.value.expiration.getTime() < Date.now()) {
            verifiedQueue.delete(item.key);
            // new token/link is generated from /login route
            res.status(404).json({ message: 'Token expired.' });
            return;
        }

        const sql_query = 'UPDATE users SET verified=1 WHERE uid=?';
        const [rows] = await connection.query<RowDataPacket[]>(sql_query, [item.key]);

        // should never be true
        if(!rows || rows.affectedRows === 0) {
            res.status(500).json({ message: 'User not found.' });
            console.warn(`Token exists but user does not exist. ${item}`);
            return;
        }

        // delete the token from the Map
        verifiedQueue.delete(item.key);

        res.status(200).json({ message: 'Account activated.' });
        return;
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if(connection) {
            connection.release();
        }
    }
});

// TYPE: POST
// REQUIREMENT: NONE
// RETURN: LOGIN ROUTE
router.post('/sessions', async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await pool.getConnection();

        if(!config.user_accounts) {
            res.status(503).json({ message: 'Service temporarily disabled.' });
            return;
        }

        const input_data = {
            username: req.body.username,
            password: req.body.password,

            invalid: function() {
                // user accounts have a limit to characters
                if (!this.username || this.username.length === 0 || this.username.length >=22 || this.username.length <= 3)
                    return true;

                // passwords have a limit to characters
                if (!this.password || this.password.length === 0 || this.password.length >= 80 || this.password.length <=6)
                    return true;

                return false;
            }
        };

        if(input_data.invalid()) {
            res.status(400).json({ message: 'Bad request.' });
            return;
        }

        if(req.session.user) {
            res.status(409).json({ message: 'User already logged in.' });
            return;
        }

        const sql_query = 'SELECT uid, email, username, password, picture, verified, rankLevel FROM users WHERE username=?';
        const [rows] = await connection.query<RowDataPacket[]>(sql_query, [input_data.username]);

        if(!rows || rows.length === 0 || rows.length > 1) {
            res.status(500).json({ message: 'User not found.' });
            return;
        }

        const same_pass = await bcrypt.compare(input_data.password, rows[0].password);
        if(!same_pass) {
            res.status(401).json({ message: 'Bad password.' });
            return;
        }

        if(!rows[0].verified) {
            let token = verifiedQueue.get(rows[0].uid);
            const newToken = uuidv4();
            const expiration = new Date(Date.now() + 3 * 60 * 60 * 1000); // +3 hours current time
            if(token) {
                // email was already sent but account was not verified

                // only send a new token when the current token has expired
                if (token.expiration.getTime() < Date.now()) {
                    verifiedQueue.delete(rows[0].uid);
                    verifiedQueue.set(rows[0].uid, { token: newToken, expiration });
                }

                // todo: find a use for this
                token = verifiedQueue.get(rows[0].uid);
            } else {
                // verified email was never sent for some reason or expired
                verifiedQueue.set(rows[0].uid, { token: newToken, expiration });

                // todo: find a use for this
                token = verifiedQueue.get(rows[0].uid);
            }

            res.status(403).json({ message: 'Account not verified. Check your email.' });
            return;
        }

        const user = {
            username: rows[0].username,
            uid: rows[0].uid,
            picture: rows[0].picture,
            rank: rows[0].rankLevel
        }

        req.session.user = user;
        // todo: insert into active_users table that user logged on. Data sent would be username, no need for uid as username is unique.

        // logging information when we are not in production
        if(!config.production) {
            console.log(`UID: ${user.uid} logged in at ${Date.now()}`);
        }

        // active_users table can later be used to stop double login-s
        active_users.set(user.uid, { username: user.username, picture: user.picture });

        return res.status(202).json({ message: 'Logged in.', data: {
                uid: user.uid,
                username: user.username,
                picture: user.picture
            }});
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
// RETURN: REGISTER ROUTE
router.put('/users', async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await pool.getConnection();

        if(!config.user_accounts) {
            res.status(503).json({ message: 'Service temporarily disabled.' });
            return;
        }

        const input_data = {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,

            invalid: function() {
                // user accounts have a limit to characters
                if (!this.username || this.username.length === 0 || this.username.length >=22 || this.username.length <= 3)
                    return true;

                // passwords have a limit to characters
                if (!this.password || this.password.length === 0 || this.password.length >= 80 || this.password.length <=6)
                    return true;

                const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (this.email.length === 0 || !regex.test(this.email))
                    return true;

                return false;
            }
        };

        if(input_data.invalid()) {
            res.status(400).json({ message: 'Bad request.' });
            return;
        }

        if(req.session.user) {
            res.status(409).json({ message: 'User already logged in.' });
            return;
        }

        const salt = await bcrypt.genSalt(12);
        const hashed_pass = await bcrypt.hash(input_data.password, salt);

        const sql_query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?);';
        const [rows] = await connection.query<RowDataPacket[]>(sql_query, [input_data.username, input_data.email, hashed_pass]);

        if(!rows || rows.affectedRows === 0) {
            res.status(500).json({ message: 'Failed inserting user.' });
            return;
        }

        const newToken = uuidv4();
        const expiration = new Date(Date.now() + 3 * 60 * 60 * 1000); // +3 hours current time
        verifiedQueue.set(rows[0].uid, { token: newToken, expiration });

        // send mail to user with token
        const link = `${config.ip}/verify/${newToken}`;
        const mailOptions = {
            from: config.email,
            to: input_data.email,
            subject: 'DStruct Account Confirmation',
            text: `Activate your account from the following link: ${link}`
        };

        sendMail(mailOptions);

        // logging information when we are not in production
        if(!config.production) {
            console.log(`UID: ${rows[0].uid} registered at ${Date.now()}`);
        }

        return res.status(202).json({ message: 'Registered user.' });
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
// REQUIREMENT: NONE
// RETURN: RETURNS CURRENT SESSION
router.get('/sessions', async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const session = req.session.user;
        if(!session) {
            // we send 200 because the response we get is still okay
            res.status(200).json({ message: 'User not logged in.' });
            return;
        }

        return res.status(200).json({ message: 'Success.', data: {
                uid: session.uid,
                username: session.username,
                picture: session.picture
            }});
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
// RETURN: DESTROYS CURRENT SESSION
router.delete('/sessions', async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await pool.getConnection();

        if(req.session.user) {
            await active_users.delete(req.session.user.uid);
        }

        req.session.destroy( async(error) => {
           if(error) {
               res.status(500).json({ message: 'Failed to destroy session.' });
               return;
           }

           return res.status(200).json({ message: 'Session destroyed.' });
        });
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