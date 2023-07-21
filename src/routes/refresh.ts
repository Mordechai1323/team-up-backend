import express from 'express';
const router = express.Router();
import refreshTokenController from '../controllers/users/refreshTokenController';
import { authRefresh } from'../middleware/auth'

router.get('/', authRefresh, refreshTokenController.handleRefreshToken);

export = router;
