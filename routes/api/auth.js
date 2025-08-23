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
      { id: user.id, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true, 
      token,
      user: { email: user.email, role: user.role },
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
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const userManager = new UserManager(req.db);
    const hasUsers = await userManager.hasUsers();

    if (hasUsers) {
      return res.status(400).json({ error: 'Setup already completed' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    await userManager.createUser(email, password, 'admin');

    const token = jwt.sign(
      { email, role: 'admin' }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true, 
      token,
      user: { email, role: 'admin' },
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

module.exports = router;