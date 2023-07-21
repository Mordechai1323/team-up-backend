const express = require('express');
const router = express.Router();
const teamsController = require('../../controllers/teams/teamsController');
const { auth } = require('../../middlewares/auth');

router
  .route('/')
  .get(auth, teamsController.getTeam)
  .post(auth, teamsController.createTeam)
  .delete(auth, teamsController.deleteTeam);

router.route('/addTeamMember').post(auth, teamsController.addTeamMember);
router.route('/removeTeamMember').post(auth, teamsController.removeTeamMember);

module.exports = router;
