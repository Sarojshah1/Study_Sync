const Task = require("../models/TaskModel");

// Create a new task
const createTask = async (req, res) => {
  try {
    const { project_id, title, description, assignee_id, priority, deadline } = req.body;

    const newTask = new Task({
      project_id,
      title,
      description,
      assignee_id,
      priority,
      deadline
    });

    await newTask.save();
    return res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating task", error: error.message });
  }
};


const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignee_id", "name email").populate("project_id", "name");
    return res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

// Get a task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("assignee_id", "name email").populate("project_id", "name");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching task", error: error.message });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating task", error: error.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting task", error: error.message });
  }
};

const changeTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["To Do", "In Progress", "Done"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ message: "Task status updated", task });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating task status", error: error.message });
  }
};

const getTasksByProjectId = async (req, res) => {
    try {
      const { project_id } = req.params;
  
      const tasks = await Task.find({ project_id })
        .populate("assignee_id", "name email")
        .populate("project_id", "name");
  
      if (tasks.length === 0) {
        return res.status(404).json({ message: "No tasks found for this project" });
      }
  
      return res.status(200).json(tasks);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching tasks", error: error.message });
    }
  };
  

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  changeTaskStatus,
  getTasksByProjectId
};
