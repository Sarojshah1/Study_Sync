const Chat = require('../models/ChatModel');
const io = require('../utils/socket'); 

// Create a new chat message
const createChatMessage = async (req, res) => {
  try {
    const { context_type, context_id,  message_content } = req.body;
    const id= req.user._id;
    console.log(id);
    

    if (!context_type || !context_id  || !message_content) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Create a new chat message
    const newChat = new Chat({
      context_type,
      context_id,
      sender_id:req.user._id,
      message_content,
    });

    const savedChat = await newChat.save();
    await savedChat.populate('sender_id', 'name email profile_picture');

    const io = req.app.get('io');
    io.to(context_id).emit('newMessage', savedChat);

    return res.status(201).json(savedChat);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating chat message', error: error.message });
  }
};

const getChatMessagesByContext = async (req, res) => {
  try {
    const { context_id } = req.params;

    if (!context_id) {
      return res.status(400).json({ message: 'Context ID is required.' });
    }

    // Find all messages for the given context_id
    const messages = await Chat.find({ context_id }).populate('sender_id', 'name email profile_picture');

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving chat messages', error: error.message });
  }
};

module.exports = {
  createChatMessage,
  getChatMessagesByContext,
};
