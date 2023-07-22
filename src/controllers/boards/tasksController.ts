import { Request, Response } from 'express';
import { validateEditGroup } from '../../models/groupModel';
import { TaskModel, validateTask, validateEditStatus } from '../../models/taskModel';
import { validateUserEmail } from '../../models/boardModel';

const getTasks = async (req: Request, res: Response) => {
  const groupID = req.query.groupID;
  try {
    const tasks = await TaskModel.findOne({ group_id: groupID });

    return res.json(tasks);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const addTask = async (req: Request, res: Response) => {
  const validBody = validateTask(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  const groupID = req.query.groupID;
  try {
    const tasks = await TaskModel.findOne({ group_id: groupID });
    if (!tasks) return res.sendStatus(400);

    tasks.tasks.push({
      name: req.body.name,
      status: { name: '', style: 'rgb(121, 126, 147)' },
    });
    await tasks.save();

    return res.json(tasks);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const addInCare = async (req: Request, res: Response) => {
  const validBody = validateUserEmail(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  const groupID = req.query.groupID;
  const taskID = req.query.taskID;
  try {
    const tasks = await TaskModel.findOne({ group_id: groupID });
    if (!tasks) return res.sendStatus(400);
    tasks?.tasks.forEach((task) => {
      if (task.id === taskID) {
        if (!task.in_care?.includes(req.body.user_email)) task.in_care?.push(req.body.user_email);
      }
    });
    await tasks.save();

    return res.status(201).json(tasks);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const deleteInCare = async (req: Request, res: Response) => {
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
        const index = task.in_care?.indexOf(req.body.user_email);
        if (index && index !== -1) task.in_care?.splice(index, 1);
      }
    });
    await tasks.save();

    return res.status(201).json(tasks);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const changeStatus = async (req: Request, res: Response) => {
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

const editTask = async (req: Request, res: Response) => {
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

const deleteTask = async (req: Request, res: Response) => {
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

export default {
  getTasks,
  addTask,
  addInCare,
  deleteInCare,
  changeStatus,
  editTask,
  deleteTask,
};
