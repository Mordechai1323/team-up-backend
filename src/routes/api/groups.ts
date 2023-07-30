import express from 'express';
const router = express.Router();
import groupsController from '../../controllers/boards/groupsController';
import { auth } from '../../middleware/auth';

router
  .route('/')
  .get(auth, groupsController.getGroups)
  .post(auth, groupsController.addGroup)
  .put(auth, groupsController.editGroup)
  .delete(auth, groupsController.deleteGroup);

router.route('/searchGroups').get(auth, groupsController.searchGroups);
router.route('/changeIsOpen').post(auth, groupsController.changeIsOpen);

router.route('/tasks/addTask').post(auth, groupsController.addTask);
router.route('/tasks/editTask').put(auth, groupsController.editTask);
router.route('/tasks/deleteTask').delete(auth, groupsController.deleteTask);
router.route('/tasks/addInCare').post(auth, groupsController.addInCare);
router.route('/tasks/deleteInCare').post(auth, groupsController.deleteInCare);
router.route('/tasks/changeStatus').put(auth, groupsController.changeStatus);

export = router;
