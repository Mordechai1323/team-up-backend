"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const boardsController_1 = __importDefault(require("../../controllers/boards/boardsController"));
const auth_1 = require("../../middleware/auth");
router.route('/').post(auth_1.auth, boardsController_1.default.addBoard);
router.route('/getAllTeamBoards').get(auth_1.authTeamLeader, boardsController_1.default.getAllTeamBoards);
router.route('/getMyBoards').get(auth_1.auth, boardsController_1.default.getMyBoards);
router.route('/shareBoard/:boardID').post(auth_1.auth, boardsController_1.default.shareBoard);
router.route('/unshareBoard/:boardID').post(auth_1.auth, boardsController_1.default.unshareBoard);
router.route('/:boardID').put(auth_1.auth, boardsController_1.default.editBoard);
router.route('/:boardID').delete(auth_1.auth, boardsController_1.default.deleteBoard);
module.exports = router;
