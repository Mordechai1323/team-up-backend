import express from 'express';
const router = express.Router();
import boardsController from'../../controllers/boards/boardsController'
import { auth, authTeamLeader } from'../../middleware/auth'

router.route('/').post(auth, boardsController.addBoard);

router.route('/getAllTeamBoards').get(authTeamLeader, boardsController.getAllTeamBoards);

router.route('/getMyBoards').get(auth, boardsController.getMyBoards);
router.route('/shareBoard/:boardID').post(auth, boardsController.shareBoard);
router.route('/unshareBoard/:boardID').post(auth, boardsController.unshareBoard);
router.route('/:boardID').put(auth, boardsController.editBoard);
router.route('/:boardID').delete(auth, boardsController.deleteBoard);

export = router;
