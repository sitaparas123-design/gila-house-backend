const tasksModel = require('./tasks.model');
const { getIO } = require('../../sockets/socket.manager');

class TasksService {
  async getAllTasks() {
    return await tasksModel.findWithStaff();
  }

  async createTask(data) {
    const payload = {
      title: data.title,
      category: data.type || data.category,
      priority: (data.priority === 'Normal' ? 'medium' : data.priority === 'Urgent' ? 'urgent' : data.priority?.toLowerCase() || 'medium'),
      assigned_to: data.assignee_id || data.assigned_to,
      location: data.target || data.location,
      description: data.description || '',
      deadline: data.deadline === 'Today' ? new Date() : null
    };
    
    const taskId = await tasksModel.create(payload);
    
    // Notify staff
    if (payload.assigned_to) {
      const io = getIO();
      io.emit('new_task', { id: taskId, title: payload.title, assigned_to: payload.assigned_to });
    }
    
    return taskId;
  }

  async updateTaskStatus(id, status) {
    return await tasksModel.update(id, { task_status: status });
  }

  async deleteTask(id) {
    return await tasksModel.softDelete(id);
  }
}

module.exports = new TasksService();
