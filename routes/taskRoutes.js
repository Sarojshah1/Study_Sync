const express = require("express");
const taskController = require("../controllers/TaskControllers");
const {verifyToken} = require('../middlewares/Authentication');

const router = express.Router();

router.post("/",verifyToken, taskController.createTask);

router.get("/",verifyToken, taskController.getAllTasks);


router.get("/:id",verifyToken, taskController.getTaskById);


router.put("/:id",verifyToken, taskController.updateTask);


router.delete("/:id",verifyToken, taskController.deleteTask);

router.patch("/:id/status",verifyToken, taskController.changeTaskStatus);

router.get("/:project_id",verifyToken, taskController.getTasksByProjectId);

module.exports = router;
