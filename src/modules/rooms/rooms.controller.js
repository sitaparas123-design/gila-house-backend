const roomsService = require('./rooms.service');

class RoomsController {
  async getAllRooms(req, res) {
    try {
      const rooms = await roomsService.getAllRooms();
      res.json({
        success: true,
        message: 'Rooms fetched successfully',
        data: rooms
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async getAvailableRooms(req, res) {
    try {
      const rooms = await roomsService.getAvailableRooms();
      res.json({
        success: true,
        message: 'Available rooms fetched successfully',
        data: rooms
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
      await roomsService.updateRoomStatus(req.params.id, status);
      res.json({
        success: true,
        message: 'Room status updated successfully'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async createRoom(req, res) {
    try {
      const roomId = await roomsService.createRoom(req.body);
      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: { id: roomId }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async updateRoom(req, res) {
    try {
      await roomsService.updateRoom(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Room updated successfully'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async deleteRoom(req, res) {
    try {
      await roomsService.deleteRoom(req.params.id);
      res.json({
        success: true,
        message: 'Room deleted successfully'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new RoomsController();
