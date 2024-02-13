import { Router } from 'express';
import userRouter from '../routes/users';

const configureRouters = (app : Router) => {
    app.use('/api', userRouter);
};

export default configureRouters;