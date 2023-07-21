import express from 'express';
const router = express.Router();
import logoutController from'../controllers/users/logoutController'
import { authRefresh } from'../middleware/auth'

router.get('/', authRefresh, logoutController.handleLogout);

export = router;
