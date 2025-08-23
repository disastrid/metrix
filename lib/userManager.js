// Simple user management utilities for self-hosted Metrix
const bcrypt = require('bcrypt');

class UserManager {
  constructor(db) {
    this.db = db;
    this.collection = 'users';
  }

  // Create a new user (for initial setup)
  async createUser(email, password, role = 'admin') {
    try {
      const existingUser = await this.db.collection(this.collection).findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = {
        email,
        password: hashedPassword,
        role,
        createdAt: new Date(),
        lastLogin: null
      };

      const result = await this.db.collection(this.collection).insertOne(user);
      return { success: true, userId: result.insertedId };
    } catch (error) {
      throw error;
    }
  }

  // Verify user credentials
  async verifyUser(email, password) {
    try {
      const user = await this.db.collection(this.collection).findOne({ email });
      if (!user) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return null;
      }

      // Update last login
      await this.db.collection(this.collection).updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date() } }
      );

      return {
        id: user._id,
        email: user.email,
        role: user.role
      };
    } catch (error) {
      throw error;
    }
  }

  // Check if any users exist (for initial setup)
  async hasUsers() {
    try {
      const count = await this.db.collection(this.collection).countDocuments();
      return count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get user count
  async getUserCount() {
    try {
      return await this.db.collection(this.collection).countDocuments();
    } catch (error) {
      throw error;
    }
  }

  // List all users (for admin interface)
  async listUsers() {
    try {
      const users = await this.db.collection(this.collection)
        .find({}, { projection: { password: 0 } })
        .toArray();
      return users;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserManager;
