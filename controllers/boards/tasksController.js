const { validateEditGroup } = require('../../models/groupModel');
const { TaskModel, validateTask, validateEditStatus } = require('../../models/taskModel');
const { validateUserEmail } = require('../../models/projectModel');

const getTasks = async (req, res) => {
  const groupID = req.query.groupID;
  try {
    const tasks = await TaskModel.findOne({ group_id: groupID });
    if (!tasks) {
      return res.sendStatus(400);
    }

    return res.json(tasks);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const addTask = async (req, res) => {
  const validBody = validateTask(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  const groupID = req.query.groupID;
  try {
    const tasks = await TaskModel.findOne({ group_id: groupID });
    if (!tasks) {
      return res.sendStatus(400);
    }
    tasks.tasks.push({
      name: req.body.name,
      status: { name: '', style: 'rgb(121, 126, 147)' },
      user_email: req.tokenData.email,
    });
    await tasks.save();

    return res.json(tasks);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const addInCare = async (req, res) => {
  const validBody = validateUserEmail(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  const groupID = req.query.groupID;
  const taskID = req.query.taskID;
  try {
    const tasks = await TaskModel.findOne({ group_id: groupID });
    if (!tasks) return res.sendStatus(400);
    tasks.tasks.forEach((task) => {
      if (task.id === taskID) {
        if (!task.in_care.includes(req.body.user_email)) task.in_care.push(req.body.user_email);
      }
    });
    await tasks.save();

    return res.status(201).json(tasks);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const deleteInCare = async (req, res) => {
  const validBody = validateUserEmail(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  const groupID = req.query.groupID;
  const taskID = req.query.taskID;
  try {
    const tasks = await TaskModel.findOne({ group_id: groupID });
    if (!tasks) return res.sendStatus(400);
    tasks.tasks.forEach((task) => {
      if (task.id === taskID) {
        const index = task.in_care.indexOf(req.body.user_email);
        if (index !== -1) task.in_care.splice(index, 1);
      }
    });
    await tasks.save();

    return res.status(201).json(tasks);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const changeStatus = async (req, res) => {
  const validBody = validateEditStatus(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  const groupID = req.query.groupID;
  const taskID = req.query.taskID;
  try {
    const tasks = await TaskModel.findOne({ group_id: groupID });
    if (!tasks) return res.sendStatus(400);
    tasks.tasks.forEach((task) => {
      if (task.id === taskID) {
        task.status.name = req.body.name;
        task.status.style = req.body.style;
      }
    });
    await tasks.save();

    return res.status(201).json(tasks);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const editTask = async (req, res) => {
  const validBody = validateEditGroup(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const groupID = req.query.groupID;
    const taskID = req.query.taskID;
    const tasks = await TaskModel.findOne({ group_id: groupID });
    if (!tasks) return res.sendStatus(400);
    tasks.tasks.forEach((task) => {
      if (task.id === taskID) task.name = req.body.name;
    });
    await tasks.save();

    return res.json(tasks);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const deleteTask = async (req, res) => {
  try {
    const groupID = req.query.groupID;
    const taskID = req.query.taskID;
    const tasks = await TaskModel.findOne({ group_id: groupID });
    if (!tasks) return res.status(400).json({ err: 'tasks not found' });
    tasks.tasks = tasks.tasks.filter((task) => task.id !== taskID);
    await tasks.save();

    return res.json(tasks);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

module.exports = {
  getTasks,
  addTask,
  addInCare,
  deleteInCare,
  changeStatus,
  editTask,
  deleteTask,
};
