import { Response, NextFunction } from 'express';
import { Request } from '../types/expressOverride';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

export default {
  verifyToken: (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    const bearer = authHeader && authHeader.split(' ')[0];

    if (bearer !== 'Bearer') {
      return res.sendStatus(401);
    }

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(403).json({
        message: 'Pas de Token fournis !',
      });
    }

    return jwt.verify(token, process.env.JWT_SECRET, (err: null, decoded: { id: number }) => {
      if (err) {
        res.status(401).json({
          message: 'Veuillez vous connectez !',
        });
      }
      req.userId = decoded.id;
      next();
    });
  },
};