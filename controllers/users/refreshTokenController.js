const { UserModel, generateAccessToken } = require('../../models/userModel');

const handleRefreshToken = async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: req.tokenData._id });
    if (!user) return res.status(401).json({ err: 'fail validating token' });
    if (!user.refresh_tokens.includes(req.refreshToken)) {
      user.refresh_tokens = [];
      await user.save();
      return res.status(403).json({ err: 'fail validating token' });
    }
    const accessToken = generateAccessToken(user._id, user.role, user.email);
    res.json({ accessToken, name: user.name, role: user.role, img_url: user.img_url });
  } catch (err) {
    return res.status(403).json({ err: 'fail validating token' });
  }
};

module.exports = { handleRefreshToken };
