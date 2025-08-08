import {AuthRequest} from "../middleware/auth";
import jwt from 'jsonwebtoken';
import config from "../config";
import { Response, NextFunction, Request } from "express";
import { supabaseService } from '../services/supabaseService';
import { v4 as uuidv4 } from 'uuid';

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
      const { usernameOrEmail, password } = req.body;

      if (!usernameOrEmail || !password) {
          return res.status(400).json({ error: 'Username/email and password are required' });
      }

      // Authenticate user
      const player = await supabaseService.authenticatePlayer(usernameOrEmail, password);
      
      if (!player) {
          return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
          {userId: player.user_id, userName: player.username || player.email}, 
          config.jwtSecret, 
          {expiresIn: '12h'}
      );
      
      res.status(200).json({
          token,
          user: {
              userId: player.user_id,
              userName: player.username || player.email
          }
      });
  } catch (error) {
      next(error);
  }
};

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
          return res.status(400).json({ error: 'Username, email, and password are required' });
      }

      // Check if user already exists
      const existingPlayer = await supabaseService.findPlayerByUsernameOrEmail(username);
      if (existingPlayer) {
          return res.status(409).json({ error: 'Username already exists' });
      }

      const existingEmail = await supabaseService.findPlayerByUsernameOrEmail(email);
      if (existingEmail) {
          return res.status(409).json({ error: 'Email already exists' });
      }

      // Create new player
      const player = await supabaseService.createPlayer({
          user_id: uuidv4(),
          username,
          email,
          password,
          room_id: null
      });

      const token = jwt.sign(
          {userId: player.user_id, userName: player.username || player.email}, 
          config.jwtSecret, 
          {expiresIn: '12h'}
      );
      
      res.status(201).json({
          token,
          user: {
              userId: player.user_id,
              userName: player.username || player.email
          }
      });
  } catch (error) {
      next(error);
  }
};

export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
          return res.status(401).json({ error: 'Access token required' });
      }

      jwt.verify(token, config.jwtSecret, (err, decoded) => {
          if (err) {
              return res.status(403).json({ error: 'Invalid or expired token' });
          }

          const user = decoded as { userId: string; userName: string };
          res.status(200).json({ 
              valid: true, 
              user: {
                  userId: user.userId,
                  userName: user.userName
              }
          });
      });
  } catch (error) {
      next(error);
  }
};