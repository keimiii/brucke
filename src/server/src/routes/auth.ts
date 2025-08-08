import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

// Login
router.post('/login', authController.login);

// Register
router.post('/register', authController.register);

// Validate token
router.get('/validate', authController.validateToken);

export default router;