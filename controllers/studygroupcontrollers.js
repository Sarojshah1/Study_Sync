const StudyGroup = require('../models/StudyGroupModel');
const User = require('../models/UserModel'); 
const path = require('path');
const fs = require('fs');

const createStudyGroup = async (req, res) => {
  try {
    const { group_name, description } = req.body;
    const userId = req.user._id; 
    let groupPhotos=null;
    if(req.files){
            const { groupPhoto } = req.files;
            groupPhotos=`group-photo-${Date.now()}-${groupPhoto.name}`;
            const uploadPath = path.join(__dirname, `../public/${groupPhotos}`);
            const directoryPath = path.join(__dirname, '../public');
            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath, { recursive: true });
              }
              await groupPhoto.mv(uploadPath);
        }else {
            return res.status(400).json({ message: ' Profile Photo is required.' });
          }

    const newGroup = new StudyGroup({
      group_name,
      description,
      groupPhoto:groupPhotos,
      created_by: userId,
      members: [{ user_id: userId, joined_at: Date.now() }], 
    });

    await newGroup.save();

    await User.findByIdAndUpdate(
      req.user._id,
    { $addToSet: { groups: newGroup._id} },
    { new: true }
  );

    res.status(201).json({ message: 'Study group created successfully', group: newGroup });
  } catch (error) {
    console.error('Error creating study group:', error);
    res.status(500).json({ error: 'Failed to create study group' });
  }
};


const sendJoinRequest = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Study group not found' });
    }

    const isAlreadyMember = group.members.some((member) => member.user_id.toString() === userId);
    const hasAlreadyRequested = group.join_requests.some((request) => request.user_id.toString() === userId);

    if (isAlreadyMember) {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }

    if (hasAlreadyRequested) {
      return res.status(400).json({ error: 'You have already sent a join request to this group' });
    }

    group.join_requests.push({ user_id: userId });
    await group.save();

    res.status(200).json({ message: 'Join request sent successfully' });
  } catch (error) {
    console.error('Error sending join request:', error);
    res.status(500).json({ error: 'Failed to send join request' });
  }
};

const acceptJoinRequest = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const adminId = req.user._id; 

    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Study group not found' });
    }


   

    const requestIndex = group.join_requests.findIndex((request) => request.user_id.toString() === userId);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Join request not found' });
    }


    group.members.push({ user_id: userId, joined_at: Date.now() });
    group.join_requests.splice(requestIndex, 1);

    await group.save();

    res.status(200).json({ message: 'User has been added to the group as a member', group });
  } catch (error) {
    console.error('Error accepting join request:', error);
    res.status(500).json({ error: 'Failed to accept join request' });
  }
};

const updateStudyGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { group_name, description } = req.body;
    const adminId = req.user._id;

    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Study group not found' });
    }

    if (group.created_by.toString() !== adminId) {
      return res.status(403).json({ error: 'Only the group admin can update group details' });
    }


    if (group_name) group.group_name = group_name;
    if (description) group.description = description;

    await group.save();

    res.status(200).json({ message: 'Study group details updated successfully', group });
  } catch (error) {
    console.error('Error updating study group details:', error);
    res.status(500).json({ error: 'Failed to update study group details' });
  }
};

const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await StudyGroup.find({ 'members.user_id': userId });
    res.status(200).json({ groups });
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ error: 'Failed to fetch user groups' });
  }
};

const getAllGroups = async (req, res) => {
    try {
    
      const groups = await StudyGroup.find().populate('created_by', 'name email'); 
  
      res.status(200).json({ message: 'All groups retrieved successfully', groups });
    } catch (error) {
      console.error('Error fetching all groups:', error);
      res.status(500).json({ error: 'Failed to fetch all groups' });
    }
  };
  

module.exports = {
  createStudyGroup,
  sendJoinRequest,
  acceptJoinRequest,
  updateStudyGroup,
  getUserGroups,
  getAllGroups
};
