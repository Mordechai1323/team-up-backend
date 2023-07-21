const express = require('express');
const router = express.Router();
const boardsController = require('../../controllers/boards/boardsController');
const { auth, authTeamLeader } = require('../../middlewares/auth');

router.route('/').post(auth, boardsController.addBoard);

router.route('/getAllTeamBoards').get(authTeamLeader, boardsController.getAllTeamBoards);

router.route('/getMyBoards').get(auth, boardsController.getMyBoards);
router.route('/shareBoard/:boardID').post(auth, boardsController.shareBoard);
router.route('/unshareBoard/:boardID').post(auth, boardsController.unshareBoard);
router.route('/editBoard/:boardID').put(auth, boardsController.editBoard);
router.route('/:boardID').delete(auth, boardsController.deleteBoard);

module.exports = router;
