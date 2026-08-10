const bcrypt = require('bcryptjs');
const reservationsModel = require('./reservations.model');
const pool = require('../../database/connection');
const { getIO } = require('../../sockets/socket.manager');
const notificationService = require('../notifications/notifications.service');

class ReservationsService {
  async getAllReservations(filters) {
    return await reservationsModel.findWithGuestDetails(filters);
  }

  async createReservation(data) {
    let guest_id = data.guest_id;
    const { email, phone, guestName } = data;

    // If password is provided, try to create a customer user account
    if (data.password && email) {
      try {
        const [existingUsers] = await pool.execute(
          'SELECT id FROM users WHERE email = ? AND deletedAt IS NULL',
          [email]
        );
        if (existingUsers.length === 0) {
          const [roleRows] = await pool.execute(
            'SELECT id FROM roles WHERE role_name = ? AND deletedAt IS NULL LIMIT 1',
            ['customer']
          );
          const roleId = roleRows.length > 0 ? roleRows[0].id : 6;
          const hashedPassword = await bcrypt.hash(data.password, 10);
          await pool.execute(
            'INSERT INTO users (full_name, email, phone, password, role_id, status) VALUES (?, ?, ?, ?, ?, ?)',
            [guestName || 'Walk-in Guest', email, phone || null, hashedPassword, roleId, 'active']
          );
        }
      } catch (userErr) {
        console.error('Error creating user account during reservation:', userErr);
      }
    }

    // Resolve Guest if guestName, email or phone is provided
    if ((guestName || email || phone) && !guest_id) {
      // Try to find guest by email or phone first
      let guestRows = [];
      if (email) {
        [guestRows] = await pool.execute(
          'SELECT id FROM guests WHERE email = ? AND deletedAt IS NULL',
          [email]
        );
      }
      
      if (guestRows.length === 0 && phone) {
        [guestRows] = await pool.execute(
          'SELECT id FROM guests WHERE phone = ? AND deletedAt IS NULL',
          [phone]
        );
      }

      if (guestRows.length > 0) {
        guest_id = guestRows[0].id;
        // Optionally update guest info if provided
        if (guestName || email || phone) {
          await pool.execute(
            'UPDATE guests SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE id = ?',
            [guestName || null, email || null, phone || null, guest_id]
          );
        }
      } else {
        // Create new guest
        const [result] = await pool.execute(
          'INSERT INTO guests (full_name, email, phone) VALUES (?, ?, ?)',
          [guestName || 'Walk-in Guest', email || null, phone || null]
        );
        guest_id = result.insertId;
      }
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const payload = {
        reservation_code: data.id || data.reservation_code || `RES-${Date.now().toString().slice(-6)}`,
        guest_id: guest_id,
        table_id: data.table_id || data.targetId || null,
        room_id: data.room_id || null,
        booking_type: (data.type || data.booking_type || 'table').toLowerCase(),
        booking_date: data.date || data.booking_date || new Date().toISOString().split('T')[0],
        booking_time: data.time || data.booking_time || new Date().toTimeString().split(' ')[0],
        guests_count: data.guests || data.guests_count || 1,
        special_notes: data.notes || data.special_notes || '',
        reservation_status: (data.status || data.reservation_status || 'pending').toLowerCase()
      };

      // If table_id is provided as a string (e.g. "T-01"), try to find the actual ID
      if (payload.table_id && isNaN(payload.table_id)) {
        const [tableRows] = await connection.execute(
          'SELECT id FROM restaurant_tables WHERE table_code = ? OR id = ?',
          [payload.table_id, payload.table_id]
        );
        if (tableRows.length > 0) {
          payload.table_id = tableRows[0].id;
        } else {
          payload.table_id = null;
        }
      }

      const reservationId = await reservationsModel.create(payload);

      // If it's a table booking and table_id is known, update table status
      if (payload.booking_type === 'table' && payload.table_id) {
        await connection.execute(
          'UPDATE restaurant_tables SET status = "reserved" WHERE id = ?',
          [payload.table_id]
        );
      }

      // If it's a room booking, handle extra logic
      if (payload.booking_type === 'room' && data.room_id) {
        // 1. Create Room Booking record
        const roomBookingSql = `
          INSERT INTO room_bookings (room_id, reservation_id, check_in, check_out, total_guests) 
          VALUES (?, ?, ?, ?, ?)
        `;
        await connection.execute(roomBookingSql, [
          data.room_id,
          reservationId,
          payload.booking_date,
          data.check_out || payload.booking_date, // Default to same day if not provided
          payload.guests_count
        ]);

        // 2. Update Room status to occupied
        await connection.execute(
          'UPDATE rooms SET room_status = "occupied" WHERE id = ?',
          [data.room_id]
        );

        // 3. Get room rate
        const [roomRows] = await connection.execute('SELECT base_rate, room_name FROM rooms WHERE id = ?', [data.room_id]);
        const roomRate = roomRows.length > 0 ? parseFloat(roomRows[0].base_rate || 0) : 0;
        const roomName = roomRows.length > 0 ? roomRows[0].room_name : 'Room';

        // 4. Initialize Guest Billing
        const billingSql = `
          INSERT INTO guest_billing (guest_id, reservation_id, total_charges, paid_amount, remaining_balance, billing_status) 
          VALUES (?, ?, ?, 0, ?, 'open')
        `;
        const [billingResult] = await connection.execute(billingSql, [guest_id, reservationId, roomRate, roomRate]);
        const billingId = billingResult.insertId;

        // 5. Add initial room charge to billing_charges
        if (roomRate > 0) {
          const chargeSql = `
            INSERT INTO billing_charges (billing_id, description, amount, type, charge_date) 
            VALUES (?, ?, ?, 'Room', ?)
          `;
          await connection.execute(chargeSql, [
            billingId, 
            `${roomName} - Daily Rate`, 
            roomRate, 
            payload.booking_date
          ]);
        }
      }

      await connection.commit();
      
      // Notify staff
      const io = getIO();
      io.emit('new_reservation', { id: reservationId, date: payload.booking_date, type: payload.booking_type, table_id: payload.table_id });
      if (payload.table_id) {
        io.emit('table_status_update', { id: payload.table_id, status: 'reserved' });
      }

      await notificationService.createNotification({
        notification_type: 'RESERVATION',
        message: `New ${payload.booking_type} reservation: ${payload.reservation_code}`,
        targetRole: 'RECEPTION'
      });
      
      await notificationService.createNotification({
        notification_type: 'RESERVATION',
        message: `New booking received for ${payload.booking_date} from ${guestName || 'Guest'}`,
        targetRole: 'ADMIN'
      });
      
      return { reservationId, guestId: guest_id };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }


  async updateStatus(id, status) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Fetch reservation to check type and table_id
      const [resRows] = await connection.execute(
        'SELECT booking_type, table_id FROM reservations WHERE id = ?',
        [id]
      );

      if (resRows.length > 0) {
        const res = resRows[0];
        // 2. Update reservation status
        await connection.execute(
          'UPDATE reservations SET reservation_status = ? WHERE id = ?',
          [status.toLowerCase(), id]
        );

        // 3. If it's a table booking, sync table status
        if (res.booking_type === 'table' && res.table_id) {
          let newTableStatus = null;
          if (status.toLowerCase() === 'checked_in') newTableStatus = 'occupied';
          if (status.toLowerCase() === 'cancelled') newTableStatus = 'available';
          if (status.toLowerCase() === 'completed') newTableStatus = 'available';

          if (newTableStatus) {
            await connection.execute(
              'UPDATE restaurant_tables SET status = ? WHERE id = ?',
              [newTableStatus, res.table_id]
            );
            
            const io = getIO();
            io.emit('table_status_update', { id: res.table_id, status: newTableStatus });
          }
        }
      }

      await connection.commit();

      // Notify customer/staff
      const io = getIO();
      io.emit('reservation_update', { id, status });

      await notificationService.createNotification({
        notification_type: 'RESERVATION_UPDATE',
        message: `Reservation #${id} status changed to ${status}`,
        targetRole: 'RECEPTION'
      });
      
      return { success: true };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async deleteReservation(id) {
    return await reservationsModel.softDelete(id);
  }
}

module.exports = new ReservationsService();
