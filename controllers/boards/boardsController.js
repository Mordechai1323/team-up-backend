const { ProjectModel, validateProject, validateUserEmail } = require('../../models/projectModel');
const { GroupModel } = require('../../models/groupModel');
const { TaskModel } = require('../../models/taskModel');
const { TeamModel } = require('../../models/teamModel');
const { UserModel } = require('../../models/userModel');

const getAllTeamBoards = async (req, res) => {
  try {
    const team = await TeamModel.findOne({ team_leader_id: req.tokenData._id });
    const allTeamProjects = await Promise.all(
      team.team_members.map(async (teamMemberId) => {
        const user = await UserModel.findOne({ _id: teamMemberId });
        const projects = await ProjectModel.find({ user_id: user._id });
        return { name: user.name, projects };
      })
    );

    res.json(allTeamProjects);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const getMyBoards = async (req, res) => {
  let search = req.query.s;
  let searchExp = new RegExp(search, 'i');
  try {
    const projects = await ProjectModel.find({
      $and: [{ name: searchExp }, { share_with: { $elemMatch: { user_id: req.tokenData._id } } }],
    });

    // const allProjects = await Promise.all(
    //   projects.map(async (project) => {
    //     if (project.user_id === req.tokenData._id || project.share_with.includes(req.tokenData._id)) return project;
    //   })
    // );

    res.json(projects);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const addBoard = async (req, res) => {
  const validBody = validateProject(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const project = new ProjectModel(req.body);
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

const shareBoard = async (req, res) => {
  const validBody = validateUserEmail(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const boardID = req.params.boardID;
    const user = await UserModel.findOne({ email: req.body.user_email });
    if (!user) return res.sendStatus(400);
    const project = await ProjectModel.findOne({ _id: boardID });
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

const unshareBoard =  async (req, res) => {
  const validBody = validateUserEmail(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const boardID = req.params.boardID;
    const project = await ProjectModel.findOne({ _id: boardID });
    if (!project) return res.sendStatus(400);
    project.share_with = project.share_with.filter((user) => user.email !== req.body.user_email || user.isOwner);
    await project.save();

    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
    6;
  }
}


// const unshareBoard = async (req, res) => {
//   const validBody = validateUserEmail(req.body);
//   if (validBody.error) {
//     return res.status(400).json(validBody.error.details);
//   }
//   try {
//     const boardID = req.params.boardID;
//     const project = await ProjectModel.findOne({ _id: boardID });
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

const editBoard = async (req, res) => {
  const validBody = validateProject(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const boardID = req.params.boardID;
    const update = await ProjectModel.updateOne({ _id: boardID }, req.body);

    res.json(update);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const deleteBoard = async (req, res) => {
  try {
    const boardID = req.params.boardID;
    let project = await ProjectModel.findOne({ _id: boardID });
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
    const deleted = await ProjectModel.deleteOne({ _id: boardID });

    res.status(200).json(deleted);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

module.exports = {
  getAllTeamBoards,
  getMyBoards,
  addBoard,
  shareBoard,
  unshareBoard,
  editBoard,
  deleteBoard,
};
