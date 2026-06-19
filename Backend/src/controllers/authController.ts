import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_me_in_production';

/**
 * Register a new library staff user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, name } = req.body;

    // Validate inputs
    if (!username || !password || !name) {
      res.status(400).json({ error: 'Username, password, and name are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ error: 'Username is already taken' });
      return;
    }

    // Create and save new user
    const newUser = new User({
      username: username.toLowerCase(),
      password,
      name,
    });

    await newUser.save();

    // Respond with created user details (excluding password)
    res.status(201).json({
      message: 'Staff user registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        name: newUser.name,
      },
    });
  } catch (error: any) {
    console.error('Error in registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Log in a library staff user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validate inputs
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    // Find the user by username
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Respond with token and user details
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
