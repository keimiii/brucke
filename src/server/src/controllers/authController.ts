import {AuthRequest} from "../middleware/auth";
import jwt from 'jsonwebtoken';
import config from "../config";
import { Response, NextFunction } from "express";

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
      const authReq = req.body.user;
      const token = jwt.sign({userId: authReq!.id}, config.jwtSecret, {
          expiresIn: '4h',
      });
      res.status(200).json({token});
  } catch (error) {
      throw error;
  }
};