import { Request, Response } from 'express';
import { BoardModel, validateProject, validateUserEmail } from '../../models/boardModel';
import { GroupModel } from '../../models/groupModel';
import { TaskModel } from '../../models/taskModel';
import { TeamModel } from '../../models/teamModel';
import { UserModel } from '../../models/userModel';

interface MyRequest extends Request {
  query: {
    s: string;
  };
}

const getAllTeamBoards = async (req: Request, res: Response) => {
  try {
    const team = await TeamModel.findOne({ team_leader_id: req.tokenData._id });
    if (!team) return res.sendStatus(400);
    const allTeamProjects = await Promise.all(
      team.team_members.map(async (teamMemberId: string) => {
        const user = await UserModel.findOne({ _id: teamMemberId });
        if (user) {
          const projects = await BoardModel.find({ user_id: user._id });
          return { name: user.name, projects };
        }
      })
    );

    res.json(allTeamProjects);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const getMyBoards = async (req: MyRequest, res: Response) => {
  let search = req.query.s;
  let searchExp = new RegExp(search, 'i');

  try {
    const boards = await BoardModel.find({
      $and: [{ name: searchExp }, { share_with: { $elemMatch: { user_id: req.tokenData._id } } }],
    });

    // const allboards = await Promise.all(
    //   boards.map(async (project) => {
    //     if (project.user_id === req.tokenData._id || project.share_with.includes(req.tokenData._id)) return project;
    //   })
    // );

    res.json(boards);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const addBoard = async (req: Request, res: Response) => {
  const validBody = validateProject(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const project = new BoardModel(req.body);
    const user = await UserModel.findOne({ _id: req.tokenData._id });
    if (!user) return res.sendStatus(400);
    project.share_with.push({ user_id: user._id, name: user.name, email: user.email, isOwner: true });
    project.user_id = req.tokenData._id;
    const group = new GroupModel({ project_id: project._id, name: 'Group Title' });
    const defaultTasks = [
      { name: 'Item 1', status: { name: '', style: 'rgb(121, 126, 147)' } },
      { name: 'Item 2', status: { name: 'Working on it', style: 'rgb(253, 188, 100)' } },
      { name: 'Item 3', status: { name: 'Done', style: 'rgb(51, 211, 145)' } },
    ];
    const tasks = new TaskModel({ group_id: group._id, tasks: defaultTasks });
    await project.save();
    await group.save();
    await tasks.save();

    res.status(201).json(project);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const shareBoard = async (req: Request, res: Response) => {
  const validBody = validateUserEmail(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const boardID = req.params.boardID;
    const user = await UserModel.findOne({ email: req.body.user_email });
    if (!user) return res.sendStatus(400);
    const project = await BoardModel.findOne({ _id: boardID });
    if (!project) return res.sendStatus(400);
    const isUserFound = project.share_with.some((obj) => obj.user_id === user.id);
    if (!isUserFound) {
      project.share_with.push({ user_id: user._id, name: user.name, email: user.email });
      await project.save();
    }

    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const unshareBoard = async (req: Request, res: Response) => {
  const validBody = validateUserEmail(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const boardID = req.params.boardID;
    const project = await BoardModel.findOne({ _id: boardID });
    if (!project) return res.sendStatus(400);
    project.share_with = project.share_with.filter((user) => user.email !== req.body.user_email || user.isOwner);
    await project.save();

    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
    6;
  }
};

// const unshareBoard = async (req :Request, res: Response) => {
//   const validBody = validateUserEmail(req.body);
//   if (validBody.error) {
//     return res.status(400).json(validBody.error.details);
//   }
//   try {
//     const boardID = req.params.boardID;
//     const project = await BoardModel.findOne({ _id: boardID });
//     const user = await UserModel.findOne({ email: req.body.user_email });
//     const userIndex = project.share_with.indexOf(user._id);
//     if (userIndex === -1) return res.sendStatus(400);
//     project.share_with.splice(userIndex, 1);
//     await project.save();

//     return res.sendStatus(200);
//   } catch (err) {
//     console.log(err);
//     res.status(502).json({ err });
//   }
// };

const editBoard = async (req: Request, res: Response) => {
  const validBody = validateProject(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const boardID = req.params.boardID;
    const update = await BoardModel.updateOne({ _id: boardID }, req.body);

    res.json(update);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const deleteBoard = async (req: Request, res: Response) => {
  try {
    const boardID = req.params.boardID;
    let project = await BoardModel.findOne({ _id: boardID });
    if (!project) return res.sendStatus(401);
    if (project.user_id !== req.tokenData._id) {
      project.share_with = project.share_with.filter((user) => user.user_id !== req.tokenData._id);
      await project.save();
      return res.sendStatus(401);
    }
    const groups = await GroupModel.find({ project_id: project._id });
    if (groups) {
      groups.forEach(async (group) => {
        await TaskModel.deleteOne({ group_id: group._id });
        await GroupModel.deleteOne({ project_id: group.project_id });
      });
    }
    const deleted = await BoardModel.deleteOne({ _id: boardID });

    res.status(200).json(deleted);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

export default {
  getAllTeamBoards,
  getMyBoards,
  addBoard,
  shareBoard,
  unshareBoard,
  editBoard,
  deleteBoard,
};
