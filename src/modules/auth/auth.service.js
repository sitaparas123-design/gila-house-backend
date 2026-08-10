const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const authModel = require('./auth.model');
const pool = require('../../database/connection');
const emailService = require('../../services/email.service');

class AuthService {
  async login(email, password) {
    const user = await authModel.findWithRole(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  async googleLogin(idToken) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }

    const { email, name, picture } = payload;
    
    // Check if user exists
    let user = await authModel.findWithRole(email);
    
    if (!user) {
      // Find the customer role ID
      let roleId = await authModel.findRoleByName('customer');
      if (!roleId) {
        roleId = 6; // fallback to 6 (default customer role ID in seeder)
      }
      
      // Generate a secure random password for this google user
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      // Create user
      await authModel.create({
        full_name: name || 'Google User',
        email: email,
        password: hashedPassword,
        role_id: roleId,
        avatar: picture || null,
        status: 'active'
      });
      
      // Fetch the newly created user details
      user = await authModel.findWithRole(email);
    }

    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    const sessionRole = 'customer';

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: sessionRole,
        login_method: 'google' 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Override the returned role so frontend routes correctly to customer dashboard
    userWithoutPassword.role_name = sessionRole;

    return {
      user: userWithoutPassword,
      token
    };
  }

  async appleLogin(idToken, appleUser) {
    let payload;
    try {
      const appleSignin = require('apple-signin-auth');
      try {
        payload = await appleSignin.verifyIdToken(idToken, {
          audience: process.env.APPLE_CLIENT_ID,
        });
      } catch (err) {
        console.warn('Real Apple Token Verification failed, falling back to dummy parsing for development:', err.message);
        
        // Fallback: decode JWT payload manually to get email for mock testing
        const parts = idToken.split('.');
        if (parts.length === 3) {
          const base64Url = parts[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(Buffer.from(base64, 'base64').toString().split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          payload = JSON.parse(jsonPayload);
        } else {
          throw new Error('Malformed Apple Token');
        }
      }
    } catch (error) {
      console.error('Apple token verification failed:', error);
      throw new Error('Invalid Apple token');
    }

    const email = payload.email;
    if (!email) {
      throw new Error('Email not provided in Apple Token');
    }

    // Check if user exists
    let user = await authModel.findWithRole(email);
    
    if (!user) {
      // Find the customer role ID
      let roleId = await authModel.findRoleByName('customer');
      if (!roleId) {
        roleId = 6; // fallback to 6 (default customer role ID in seeder)
      }
      
      // Determine name (Apple only passes user details once on registration)
      let fullName = 'Apple User';
      if (appleUser && appleUser.name) {
        fullName = `${appleUser.name.firstName || ''} ${appleUser.name.lastName || ''}`.trim() || 'Apple User';
      }
      
      // Generate a secure random password for this apple user
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      // Create user
      await authModel.create({
        full_name: fullName,
        email: email,
        password: hashedPassword,
        role_id: roleId,
        avatar: null,
        status: 'active'
      });
      
      // Fetch the newly created user details
      user = await authModel.findWithRole(email);
    }

    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  async updatePassword(userId, newPassword) {
    const user = await authModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await authModel.update(userId, { password: hashedPassword });
    return true;
  }

  async updateProfile(userId, profileData) {
    const user = await authModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { full_name, email, phone, profileImage } = profileData;
    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (email) {
      // Check if email already exists for another user
      const existing = await authModel.findWithRole(email);
      if (existing && existing.id !== userId) {
        throw new Error('Email is already in use');
      }
      updateData.email = email;
    }
    if (phone !== undefined) updateData.phone = phone;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    await authModel.update(userId, updateData);

    const updatedUser = await authModel.findById(userId);
    const { password, ...userWithoutPassword } = updatedUser;
    
    return userWithoutPassword;
  }

  async requestPasswordReset(email) {
    const user = await authModel.findWithRole(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 minutes from now
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update user record with OTP and expiry
    await authModel.update(user.id, {
      reset_otp: otp,
      reset_otp_expiry: expiry
    });

    // Send email
    const subject = 'Password Reset OTP - Gila House POS';
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Hello ${user.full_name},</p>
        <p>You requested a password reset. Your OTP is:</p>
        <h1 style="color: #EF8E4B; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    const emailSent = await emailService.sendEmail(email, subject, html);
    if (!emailSent) {
      throw new Error('Failed to send OTP email');
    }

    return true;
  }

  async verifyOTP(email, otp) {
    const user = await authModel.findWithRole(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.reset_otp !== otp) {
      throw new Error('Invalid OTP');
    }

    if (new Date() > new Date(user.reset_otp_expiry)) {
      throw new Error('OTP has expired');
    }

    return true;
  }

  async resetPasswordWithOTP(email, otp, newPassword) {
    // Verify again just to be safe before resetting
    await this.verifyOTP(email, otp);

    const user = await authModel.findWithRole(email);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await authModel.update(user.id, {
      password: hashedPassword,
      reset_otp: null,
      reset_otp_expiry: null
    });

    return true;
  }

  async register(data) {
    const { name, email, phone, password } = data;

    const existing = await authModel.findWithRole(email);
    if (existing) {
      throw new Error('Email is already registered');
    }

    let roleId = await authModel.findRoleByName('customer');
    if (!roleId) {
      roleId = 6;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await authModel.create({
      full_name: name,
      email,
      phone: phone || null,
      password: hashedPassword,
      role_id: roleId,
      status: 'active'
    });

    try {
      const [existingGuests] = await pool.execute(
        'SELECT id FROM guests WHERE email = ? AND deletedAt IS NULL',
        [email]
      );
      if (existingGuests.length === 0) {
        await pool.execute(
          'INSERT INTO guests (full_name, email, phone) VALUES (?, ?, ?)',
          [name, email, phone || null]
        );
      }
    } catch (guestErr) {
      console.error('Error creating guest record during registration:', guestErr);
    }

    const user = await authModel.findWithRole(email);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }
}

module.exports = new AuthService();
