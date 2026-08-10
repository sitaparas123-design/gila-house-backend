/**
 * Socket handlers specifically for the Orders module
 */
const { getIO } = require('../../sockets/socket.manager');

const setupOrderSockets = (socket) => {
  socket.on('join_order_room', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`User ${socket.id} joined order room: ${orderId}`);
  });

  socket.on('leave_order_room', (orderId) => {
    socket.leave(`order_${orderId}`);
  });
};

const notifyNewOrder = (orderData) => {
  const io = getIO();
  io.emit('new_order', orderData);
  io.to('chef').emit('new_kitchen_ticket', orderData);
};

const notifyOrderStatusChange = (orderId, status) => {
  const io = getIO();
  io.emit('order_update', { id: orderId, status });
  io.to(`order_${orderId}`).emit('order_status_changed', { status });
};

module.exports = {
  setupOrderSockets,
  notifyNewOrder,
  notifyOrderStatusChange
};
