import { Response, Request, NextFunction } from 'express';
import validate from '../validation/validator';
import logger from '../system/logger';
import sc from '../tools/statusCodes';
import jwt from 'jsonwebtoken';
require('dotenv').config();

const login = (req: Request, res: Response, next: NextFunction) => {
    logger.use(req.originalUrl, 'REQ');
    const isValid = validate.login(req.body);
    if (!isValid) {
        logger.use(req.originalUrl, 'ERR', 'Invalid request body');
        return res.status(sc.NOT_ACCEPTABLE).json(validate.login.errors);
    }

    logger.use(req.originalUrl, 'OK', 'Valid request body');
    next();
};

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    logger.use(req.originalUrl, 'REQ');
    const authHeader = req.headers.authorization || (req.headers.Authorization as string);
    if (!authHeader?.startsWith('Bearer ')) return res.status(sc.UNAUTHORIZED).json({ message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err: any, decoded: any) => {
        if (err) {
            logger.use(req.originalUrl, 'ERR', err);
            return res.status(sc.FORBIDDEN).json({ message: 'Invalid token' });
        }
        logger.use(req.originalUrl, 'OK', 'Valid token');
        // req.body.id = decoded.id;
        req.body.role = decoded.userData.role;
        next();
    });
};

const verifyRole =
    (...allowedRoles: number[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        logger.use(req.originalUrl, 'REQ');
        if (!req.body?.role) {
            logger.use(req.originalUrl, 'ERR', 'No role provided');
            return res.status(sc.UNAUTHORIZED).json({ message: 'No role provided' });
        }
        if (!allowedRoles.includes(req.body.role)) {
            // modify if many roles
            logger.use(req.originalUrl, 'ERR', 'Role unauthorized');
            return res.status(sc.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        logger.use(req.originalUrl, 'OK', 'Role authorized');
        next();
    };

export default module.exports = {
    login,
    verifyToken,
    verifyRole,
};
