const authService = require('./auth.service');

class AuthController {
  async register(req, res) {
    try {
      const { name, email, phone, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      const result = await authService.register({ name, email, phone, password });

      res.json({
        success: true,
        message: 'Registration successful',
        data: result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await authService.login(email, password);

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (err) {
      res.status(401).json({
        success: false,
        message: err.message
      });
    }
  }

  async googleLogin(req, res) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required'
        });
      }

      const result = await authService.googleLogin(token);

      res.json({
        success: true,
        message: 'Google login successful',
        data: result
      });
    } catch (err) {
      res.status(401).json({
        success: false,
        message: err.message
      });
    }
  }

  async appleLogin(req, res) {
    try {
      const { token, user } = req.body;
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required'
        });
      }

      const result = await authService.appleLogin(token, user);

      res.json({
        success: true,
        message: 'Apple login successful',
        data: result
      });
    } catch (err) {
      res.status(401).json({
        success: false,
        message: err.message
      });
    }
  }

  async getMe(req, res) {

    // req.user is set by auth middleware
    res.json({
      success: true,
      message: 'User data fetched successfully',
      data: req.user
    });
  }

  async updatePassword(req, res) {
    try {
      const { newPassword } = req.body;
      const userId = req.user.id;
      
      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: 'New password is required'
        });
      }

      await authService.updatePassword(userId, newPassword);
      
      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const profileData = req.body;
      
      const updatedUser = await authService.updateProfile(userId, profileData);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      await authService.requestPasswordReset(email);

      res.json({
        success: true,
        message: 'OTP sent to email successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and OTP are required'
        });
      }

      await authService.verifyOTP(email, otp);

      res.json({
        success: true,
        message: 'OTP verified successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async resetPasswordWithOTP(req, res) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email, OTP, and new password are required'
        });
      }

      await authService.resetPasswordWithOTP(email, otp, newPassword);

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}



module.exports = new AuthController();
