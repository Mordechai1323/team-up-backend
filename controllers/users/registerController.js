const bcrypt = require('bcrypt');
const { validateUser, UserModel, generateAccessToken, generateRefreshToken } = require('../../models/userModel');
const { validateHuman } = require('../../middlewares/auth');

const handleNewUser = async (req, res) => {
  const validBody = validateUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const human = await validateHuman(req.body.recaptchaToken);
    if (!human) return res.sendStatus(400);

    const user = new UserModel(req.body);
    user.password = await bcrypt.hash(user.password, 10);

    const accessToken = generateAccessToken(user._id, user.role, user.email);
    const refreshToken = generateRefreshToken(user._id, user.role);
    user.refresh_tokens = [refreshToken];

    await user.save();

    user.password = '*****';

    res.cookie('token', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, secure: true, sameSite: 'None' });
    res.status(201).json({ accessToken, user });
  } catch (err) {
    if (err.code == 11000) {
      return res.status(401).json({ err: 'Email already in system, try log in', code: 11000 });
    }
    console.log(err);
    res.status(502).json(err);
  }
};


module.exports = { handleNewUser };