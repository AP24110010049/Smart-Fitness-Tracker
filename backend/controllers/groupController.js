const Group = require('../models/Group');

exports.createGroup = async (req, res) => {
  try {
    const group = await Group.create({ ...req.body, createdBy: req.user.id, members: [req.user.id] });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('createdBy', 'name').populate('members', 'name email');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.members.includes(req.user.id)) return res.status(400).json({ message: 'Already a member' });
    group.members.push(req.user.id);
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    group.members = group.members.filter(m => m.toString() !== req.user.id);
    await group.save();
    res.json({ message: 'Left group' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).populate('createdBy', 'name').populate('members', 'name email');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
