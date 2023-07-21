import express from 'express';
const router = express.Router();
import teamsController from'../../controllers/teams/teamsController'
import { auth } from'../../middleware/auth'

router.route('/').get(auth, teamsController.getTeam).post(auth, teamsController.createTeam).delete(auth, teamsController.deleteTeam);

router.route('/addTeamMember').post(auth, teamsController.addTeamMember);
router.route('/removeTeamMember').post(auth, teamsController.removeTeamMember);

export = router;
