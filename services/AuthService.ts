import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { Request } from '../types/ExpressOverride';
import AuthInvalidPasswordError from '../types/error/AuthInvalidPasswordError';
import UserLockedError from '../types/error/UserLockedError';
import UserNotFoundError from '../types/error/UserNotFoundError';
import AuthInvalidTokenError from '../types/error/AuthInvalidTokenError';
import AuthNoTokenProvidedError from '../types/error/AuthNoTokenProvidedError';
import Permission from '../models/Permission';
import Role from '../models/Role';
import { TokenDecodedI, TokenTypeE } from '../types/Token';
import AuthTokenBlacklistedError from '../types/error/AuthTokenBlacklistedError';
import AuthUserLockedError from '../types/error/AuthUserLockedError';
import AuthUserNotFoundError from '../types/error/AuthUserNotFoundError';
import BlacklistTokenService from './BlacklistTokenService';

// eslint-disable-next-line
const jwt = require('jsonwebtoken');

const AuthService = {
  getAuthorizationHeader(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    return authHeader;
  },

  getLoggedTokenPrefix(payload: {req: Request} | { token: string}): string | undefined {
    let authHeader: string;
    if ('req' in payload) {
      authHeader = AuthService.getAuthorizationHeader(payload.req) as string;
    } else {
      authHeader = payload.token;
    }
    return authHeader ? authHeader.split(' ')[0] as string : undefined;
  },

  getLoggedToken(payload: {req: Request} | { token: string}): string | undefined {
    let authHeader: string;
    if ('req' in payload) {
      authHeader = AuthService.getAuthorizationHeader(payload.req) as string;
    } else {
      authHeader = payload.token;
    }
    return authHeader ? authHeader.split(' ')[1] as string : undefined;
  },

  async checkUserPasswordValidity(payload: {
    email?: string,
    username?: string,
    password: string,
  }): Promise<User> {
    if (!payload.email && !payload.username) {
      throw new UserNotFoundError('Email ou username requis');
    }

    const filterQuery: Record<string, string>[] = [];
    if (payload.email) {
      filterQuery.push({ email: payload.email });
    }
    if (payload.username) {
      filterQuery.push({ username: payload.username });
    }

    const userToLogin = await User.findOne({
      where: {
        [Op.or]: filterQuery,
      },
    });

    if (!userToLogin) {
      throw new UserNotFoundError('Compte non trouvé');
    }

    const passwordIsValid = bcrypt.compareSync(
      payload.password,
      userToLogin.password,
    );

    if (!passwordIsValid) {
      throw new AuthInvalidPasswordError('Mot de passe invalide');
    }

    if (userToLogin.locked) {
      throw new UserLockedError('Votre compte est bloqué, veuillez contacter l\'administrateur !');
    }

    return userToLogin;
  },

  checkTokenFromRequestToken(payload: {req: Request} | { token: string}): string {
    const tokenPrefix = AuthService.getLoggedTokenPrefix(payload);
    if (tokenPrefix !== 'Bearer') {
      throw new AuthInvalidTokenError('Token invalid');
    }

    const token = AuthService.getLoggedToken(payload);

    if (!token) {
      throw new AuthNoTokenProvidedError('Pas de Token fournis !');
    }

    return token;
  },

  async checkUserLoggedFromRequestToken(payload: {req: Request} | { token: string}): Promise<User> {
    const token = AuthService.checkTokenFromRequestToken(payload);

    const isTokenBlacklisted = await BlacklistTokenService.isTokenBlacklisted(token);

    if (isTokenBlacklisted) {
      throw new AuthTokenBlacklistedError('Session expirée, veuillez vous reconnecter !');
    }

    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, async (err: null, decoded: TokenDecodedI) => {
        if (err) {
          reject(new AuthInvalidTokenError('Veuillez vous connectez !'));
          return;
        }

        if (!decoded.type || decoded.type !== TokenTypeE.LOGIN_TOKEN) {
          reject(new AuthInvalidTokenError('Token invalid'));
          return;
        }

        const user = await User
          .findByPk(decoded.id, {
            include: [{ model: Role, include: [Permission] }],
          });

        if (!user) {
          reject(new AuthUserNotFoundError('Veuillez vous connectez !'));
        } else if (user.locked) {
          reject(new AuthUserLockedError('Votre compte est bloqué, veuillez contacter l\'administrateur !'));
        } else {
          resolve(user);
        }
      });
    });
  },
};

export default AuthService;
