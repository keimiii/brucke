import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

// Login
router.post('/login', authController.login);

export default router;