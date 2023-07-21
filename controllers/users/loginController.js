const bcrypt = require('bcrypt');
const { validateLogin, UserModel, generateAccessToken, generateRefreshToken } = require('../../models/userModel');
const { validateHuman } = require('../../middlewares/auth');

const handleLogin = async (req, res) => {
  const validBody = validateLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const human = await validateHuman(req.body.recaptchaToken);
    if (!human) return res.sendStatus(400);

    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) return res.sendStatus(401);

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.sendStatus(401);

    const accessToken = generateAccessToken(user._id, user.role, user.email);
    const refreshToken = generateRefreshToken(user._id, user.role);
    if (!user.refresh_tokens) user.refresh_tokens = [refreshToken];
    else user.refresh_tokens.push(refreshToken);
    await user.save();

    res.cookie('token', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, secure: true, sameSite: 'None' });
    res.json({ accessToken, name: user.name, role: user.role, img_url: user.img_url });
  } catch (err) {
    console.log(err);
    res.sendStatus(502);
  }
};

module.exports = { handleLogin };
