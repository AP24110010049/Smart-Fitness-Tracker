module.exports = function (req, res, next) {
  if (req.user.role !== 'coach') {
    return res.status(403).json({ message: 'Access denied: coaches only' });
  }
  next();
};
