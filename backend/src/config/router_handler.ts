import { Router } from 'express';

import userRouter from '../routes/users';
import documentsRouter from '../routes/documents';

const configureRouters = (app : Router) => {
    app.use('/api', userRouter);
    app.use('/api/docs/', documentsRouter);
};

export default configureRouters;