const express = require('express');
const router = express.Router();
const tasksController = require('../../controllers/boards/tasksController');
const { auth } = require('../../middlewares/auth');

router
  .route('/')
  .get(auth, tasksController.getTasks)
  .post(auth, tasksController.addTask)
  .put(auth, tasksController.editTask)
  .delete(auth, tasksController.deleteTask);

router.route('/addInCare').post(auth, tasksController.addInCare);
router.route('/deleteInCare').post(auth, tasksController.deleteInCare);
router.route('/changeStatus').put(auth, tasksController.changeStatus);

module.exports = router;
