const roomsModel = require('./rooms.model');

class RoomsService {
  async getAllRooms() {
    return await roomsModel.findAllWithGuestInfo();
  }

  async getAvailableRooms() {
    return await roomsModel.findAvailable();
  }

  async updateRoomStatus(id, status) {
    return await roomsModel.update(id, { room_status: status });
  }

  async createRoom(data) {
    const payload = {
      room_code: data.room_code || `RM-${Date.now().toString().slice(-6)}`,
      room_name: data.name || data.room_name,
      room_type: data.type || data.room_type,
      capacity: data.capacity || 2,
      room_status: (data.status || data.room_status || 'available').toLowerCase(),
      base_rate: data.base_rate || data.rate || 0.00,
      notes: data.notes || ''
    };
    return await roomsModel.create(payload);
  }

  async updateRoom(id, data) {
    const payload = {};
    if (data.name || data.room_name) payload.room_name = data.name || data.room_name;
    if (data.type || data.room_type) payload.room_type = data.type || data.room_type;
    if (data.capacity) payload.capacity = data.capacity;
    if (data.status || data.room_status) payload.room_status = (data.status || data.room_status).toLowerCase();
    if (data.base_rate !== undefined || data.rate !== undefined) payload.base_rate = data.base_rate || data.rate;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.room_code) payload.room_code = data.room_code;

    if (Object.keys(payload).length === 0) return 0;
    return await roomsModel.update(id, payload);
  }

  async deleteRoom(id) {
    return await roomsModel.softDelete(id);
  }
}

module.exports = new RoomsService();
