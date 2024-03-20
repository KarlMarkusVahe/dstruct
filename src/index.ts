import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import dotenv from 'dotenv';

import configureRouters from './config/router_handler';

import cors from 'cors';

// initialize dotenv
dotenv.config();

const app = express();

// initialize cors
const whitelisted_ips = [''];
const cors_options = {
    origin: whitelisted_ips,
    credentials: true
}

app.use(cors(cors_options));
app.options('*', cors());

// parser
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));

// session management
app.use(session({
    secret: 'kekk1mme12keiasjxcamqwkeijqdxcjasi',
    resave: false,
    saveUninitialized: true,
    cookie: {
        //domain: '',
        sameSite: 'lax',
        secure: false,
    },
}));

// configure our routers
configureRouters(app);

// start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});