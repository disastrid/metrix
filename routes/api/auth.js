const express = require('express');
const jwt = require('jsonwebtoken');
const UserManager = require('../../lib/userManager');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Login endpoint - supports both email+password and legacy password-only
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }

    const userManager = new UserManager(req.db);
    const hasUsers = await userManager.hasUsers();

    // If no users exist, fall back to legacy admin password
    if (!hasUsers) {
      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { role: 'admin', email: 'admin@localhost' }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      return res.json({ 
        success: true, 
        token,
        user: { email: 'admin@localhost', role: 'admin' },
        message: 'Login successful (legacy mode)' 
      });
    }

    // User-based authentication
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const user = await userManager.verifyUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, firstName: user.firstName }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true, 
      token,
      user: { email: user.email, role: user.role, firstName: user.firstName },
      message: 'Login successful' 
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Setup endpoint - for creating the first admin user
router.post('/setup', async (req, res) => {
  try {
    const { firstName, email, password } = req.body;
    
    if (!firstName || !email || !password) {
      return res.status(400).json({ error: 'First name, email and password required' });
    }

    const userManager = new UserManager(req.db);
    const hasUsers = await userManager.hasUsers();

    if (hasUsers) {
      return res.status(400).json({ error: 'Setup already completed' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const result = await userManager.createUser(email, password, 'admin', firstName);

    const token = jwt.sign(
      { id: result.userId, email, role: 'admin', firstName }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true, 
      token,
      user: { email, role: 'admin', firstName },
      message: 'Setup completed successfully' 
    });

  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Setup failed' });
  }
});

// Check setup status
router.get('/setup-status', async (req, res) => {
  try {
    const userManager = new UserManager(req.db);
    const hasUsers = await userManager.hasUsers();
    const userCount = await userManager.getUserCount();

    res.json({ 
      setupRequired: !hasUsers,
      userCount,
      hasLegacyPassword: !!process.env.ADMIN_PASSWORD
    });

  } catch (error) {
    console.error('Setup status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userManager = new UserManager(req.db);
    
    // For legacy mode (no user ID in token)
    if (!req.user.id) {
      return res.json({
        email: req.user.email,
        role: req.user.role,
        firstName: 'Admin' // Default for legacy mode
      });
    }

    const user = await userManager.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      email: user.email,
      role: user.role,
      firstName: user.firstName || 'Admin'
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, email } = req.body;
    
    if (!req.user.id) {
      return res.status(400).json({ error: 'Profile updates not available in legacy mode' });
    }

    const userManager = new UserManager(req.db);
    const success = await userManager.updateUser(req.user.id, { firstName, email });

    if (!success) {
      return res.status(400).json({ error: 'Update failed' });
    }

    res.json({ success: true, message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update password
router.put('/password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password required' });
    }

    if (!req.user.id) {
      return res.status(400).json({ error: 'Password updates not available in legacy mode' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const userManager = new UserManager(req.db);
    const success = await userManager.updatePassword(req.user.id, currentPassword, newPassword);

    if (!success) {
      return res.status(400).json({ error: 'Password update failed' });
    }

    res.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Password update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint (client-side mainly, but can blacklist tokens in future)
router.post('/logout', verifyToken, (req, res) => {
  // For now, just confirm the token is valid
  // In the future, we could maintain a blacklist of invalidated tokens
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;