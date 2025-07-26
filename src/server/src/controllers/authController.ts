import {AuthRequest} from "../middleware/auth";
import jwt from 'jsonwebtoken';
import config from "../config";
import { Response, NextFunction } from "express";

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
      const authReq = req.body.user;
      const token = jwt.sign({userId: authReq!.userId, userName: authReq!.userName}, config.jwtSecret, {
          expiresIn: '12h',
      });
      res.status(200).json({token});
  } catch (error) {
      throw error;
  }
};