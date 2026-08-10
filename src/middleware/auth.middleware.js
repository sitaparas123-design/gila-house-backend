const jwt = require('jsonwebtoken');
const pool = require('../database/connection');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.execute(`
      SELECT u.id, u.full_name, u.email, u.role_id, r.role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ? AND u.deletedAt IS NULL
    `, [decoded.id]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const user = rows[0];

    // If authenticated via Google, restrict session to customer role
    if (decoded.login_method === 'google') {
      user.role_name = 'customer';
      user.is_google_session = true;
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: ' + err.message
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRole = (req.user.role_name || '').toLowerCase().trim();
    const authorizedRoles = roles.flat().map(r => String(r).toLowerCase().trim());
    
    // Always allow admin role for any staff-level resource, unless it is a Google session which is strictly for customers
    const isSystemAdmin = !req.user.is_google_session && (userRole === 'admin' || Number(req.user.role_id) === 1 || req.user.email === 'admin@gilahouse.com');
    
    if (authorizedRoles.includes(userRole) || isSystemAdmin) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Forbidden: You do not have access to this resource (Role: ${userRole})`
    });
  };
};

module.exports = {
  authenticate,
  authorize
};
