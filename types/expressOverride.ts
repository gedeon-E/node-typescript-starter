import { Request as ExpressRequest } from 'express';

export type Request = ExpressRequest & { userId?: number | null }
