import express from 'express';
const router = express.Router();
import loginController from '../controllers/users/loginController';

router.post('/', loginController.handleLogin);

export = router;
