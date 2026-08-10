const serviceRepository = require('./services.repository');
const emailService = require('../../services/email.service');

class ServiceController {
  async getAllServices(req, res) {
    try {
      const services = await serviceRepository.getAllServices();
      const mappedServices = services.map(s => ({
        id: s.id,
        name: s.service_name || s.name,
        transport: s.service_type || s.transport,
        category: s.service_type || s.transport,
        price: parseFloat(s.price_per_person || s.price || 0),
        notes: s.description || s.notes,
        description: s.description || s.notes,
        image: s.image || null,
        icon: s.service_type?.toLowerCase().includes('shuttle') ? '🚐' : 
              s.service_type?.toLowerCase().includes('tour') ? '🗺️' :
              s.service_type?.toLowerCase().includes('cruise') ? '🚤' :
              s.service_type?.toLowerCase().includes('hike') ? '🥾' : '🧭'
      }));
      res.json({ success: true, data: mappedServices });
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async createService(req, res) {
    try {
      const { name, transport, price, notes, image } = req.body;
      
      if (!name || !transport || !price) {
        return res.status(400).json({ success: false, message: 'Name, Transport and Price are required' });
      }

      const id = await serviceRepository.createService({
        service_name: name,
        service_type: transport,
        price_per_person: price,
        description: notes,
        image: image || null
      });

      res.status(201).json({ 
        success: true, 
        data: { id, name, transport, price, notes, image } 
      });
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getAllBookings(req, res) {
    try {
      const bookings = await serviceRepository.getAllBookings();
      const mappedBookings = bookings.map(b => ({
        id: b.id,
        serviceId: b.service_id,
        guestId: b.guest_id,
        serviceName: b.service_name,
        category: b.service_type,
        guestName: b.guest_name,
        guestEmail: b.guest_email,
        guestPhone: b.guest_phone,
        date: b.booking_date,
        time: b.booking_time,
        guests: b.total_guests,
        total: b.total_amount,
        notes: b.notes,
        status: b.booking_status?.charAt(0).toUpperCase() + b.booking_status?.slice(1) || 'Pending'
      }));
      res.json({ success: true, data: mappedBookings });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const success = await serviceRepository.updateBookingStatus(id, status.toLowerCase());
      if (success) {
        res.json({ success: true, message: 'Booking status updated' });
      } else {
        res.status(404).json({ success: false, message: 'Booking not found' });
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async createBooking(req, res) {
    try {
      const id = await serviceRepository.createBooking(req.body);
      res.status(201).json({ success: true, id });
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async createGuestBooking(req, res) {
    try {
      // For guest bookings, we ensure guest_id is null or handled properly
      const bookingData = {
        ...req.body,
        guest_id: null
      };
      
      const id = await serviceRepository.createBooking(bookingData);
      
      // If paid via Xendit, send email notification
      if (bookingData.notes && bookingData.notes.includes('[PAID VIA XENDIT]') && bookingData.customer_email) {
        const subject = `Payment Receipt - ${bookingData.service_name || 'Transport Service'}`;
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; background: #fafafa; border-radius: 8px;">
            <div style="background: #10b981; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">Payment Successful</h1>
            </div>
            <div style="padding: 20px; background: white; border: 1px solid #eee; border-radius: 0 0 8px 8px;">
              <p>Hello <strong>${bookingData.customer_name || 'Guest'}</strong>,</p>
              <p>We have received your payment for your transport reservation at Gila House.</p>
              
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; color: #64748b;">Service:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${bookingData.service_name || 'Transport Booking'}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;">Schedule:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${bookingData.booking_date} at ${bookingData.booking_time}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;">Passengers:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${bookingData.total_guests} Person(s)</td></tr>
                  <tr><td style="padding: 8px 0; border-top: 1px solid #e2e8f0; color: #64748b; font-weight: bold;">Total Paid:</td><td style="padding: 8px 0; border-top: 1px solid #e2e8f0; font-weight: bold; color: #10b981; font-size: 18px; text-align: right;">Rp ${Number(bookingData.total_amount).toLocaleString()}</td></tr>
                </table>
              </div>
              
              <p style="color: #64748b; font-size: 12px; margin-top: 30px;">Our concierge will contact you shortly to confirm pickup details. Thank you for choosing Gila House!</p>
            </div>
          </div>
        `;
        // Send email asynchronously without blocking the response
        emailService.sendEmail(bookingData.customer_email, subject, html).catch(err => console.error('Failed to send receipt email:', err));
      }

      res.status(201).json({ success: true, id, message: 'Transport booking submitted' });
    } catch (error) {
      console.error('Error creating guest booking:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

module.exports = new ServiceController();
