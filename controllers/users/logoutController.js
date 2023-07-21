const { UserModel } = require('../../models/userModel');

handleLogout = async (req, res) => {
  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id });
    if (!user) {
      res.clearCookie('token', { httpOnly: true });
      return res.status(401);
    }
    if (!user.refresh_tokens.includes(req.refreshToken)) {
      res.clearCookie('token', { httpOnly: true });
      user.refresh_tokens = [];
      await user.save();
      return res.status(401).json({ err: 'no token' });
    }
    user.refresh_tokens.splice(user.refresh_tokens.indexOf(req.refreshToken), 1);
    await user.save();
    res.clearCookie('token', { httpOnly: true });
    res.sendStatus(200);
  } catch (err) {
    res.status(502).json(err);
  }
}


module.exports = { handleLogout }