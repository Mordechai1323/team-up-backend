import express from 'express';
const router = express.Router();
import registerController from'../controllers/users/registerController'

router.post('/', registerController.handleNewUser);

export =  router;
