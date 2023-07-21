const mongoose = require('mongoose');
const Joi = require('joi');

const teamSchema = new mongoose.Schema({
  team_leader_id: String,
  team_members: {
    type: [String],
  },
  name: String,
});

exports.TeamModel = mongoose.model('teams', teamSchema);

exports.validateTeam = (reqBody) => {
  const joiSchema = Joi.object({
    team_members: Joi.array().items(Joi.string().min(1).max(150).required()),
    name: Joi.string().min(1).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};

exports.validateTeamMember = (reqBody) => {
  const joiSchema = Joi.object({
    team_member: Joi.string().min(1).max(150).email().required(),
  });

  return joiSchema.validate(reqBody);
};
