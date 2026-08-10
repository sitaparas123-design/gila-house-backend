const tasksService = require('./tasks.service');

class TasksController {
  async getAllTasks(req, res) {
    try {
      const tasks = await tasksService.getAllTasks();
      res.json({
        success: true,
        message: 'Tasks fetched successfully',
        data: tasks
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async createTask(req, res) {
    try {
      const taskId = await tasksService.createTask(req.body);
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: { id: taskId }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      await tasksService.updateTaskStatus(req.params.id, status);
      res.json({
        success: true,
        message: 'Task status updated successfully'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async deleteTask(req, res) {
    try {
      await tasksService.deleteTask(req.params.id);
      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new TasksController();
