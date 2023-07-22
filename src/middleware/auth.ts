import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

interface IDecodeToken {
  role: string;
  _id: string;
  email?: string;
} 

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ err: 'authentication missing' });
  // const token = authHeader;
  const token = authHeader.split(' ')[1];
  try {
    let decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as IDecodeToken
    req.tokenData = decodeToken;
    next();
  } catch (err) {
    return res.status(403).json({ err: 'fail validating token' });
  }
};

export const authTeamLeader = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ err: 'authentication missing' });
  // const token = authHeader
  const token = authHeader.split(' ')[1];
  try {
    let decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as IDecodeToken
    if (decodeToken.role !== 'team_leader') {
      return res.status(401).json({ err: 'authentication missing!!!!!!!!!' });
    }
    req.tokenData = decodeToken;
    next();
  } catch (err) {
    return res.status(403).json({ err: 'fail validating token' });
  }
};

export const authAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ err: 'authentication missing' });
  // const token = authHeader
  const token = authHeader.split(' ')[1];
  try {
    let decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as IDecodeToken
    if (decodeToken.role !== 'admin') {
      return res.status(401).json({ err: 'authentication missing!!!!!!!!!' });
    }
    req.tokenData = decodeToken;
    next();
  } catch (err) {
    return res.status(403).json({ err: 'fail validating token' });
  }
};

export const authRefresh = (req: Request, res: Response, next: NextFunction) => {
  const cookies = req.cookies;
  if (!cookies?.token) return res.status(401).json({ err: 'no cookies' });
  const refreshToken = cookies.token;
  try {
    let decodeToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) as IDecodeToken
    req.tokenData = decodeToken;
    req.refreshToken = refreshToken;
    next();
  } catch (err) {
    return res.status(403).json({ err: 'fail validating token' });
  }
};

export const validateHuman = async (token: String) => {
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
  );

  return response.data.success;
};
