import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import type { User, CreateUserData, UpdateUserData } from '../config/supabase.js';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createUserSchema = z.object({
  username: z.string().min(1).max(50),
  wallet_address: z.string().length(44, 'Wallet address must be 44 characters'),
});

const updateUserSchema = z.object({
  username: z.string().min(1).max(50).optional(),
  wallet_address: z.string().length(44, 'Wallet address must be 44 characters').optional(),
});

const userIdSchema = z.object({
  id: z.string().uuid(),
});

// GET /users - Get all users
router.get('/', async (req, res) => {
  try {
    console.log('Attempting to fetch users from Supabase...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Successfully fetched users:', data);
    res.json({ users: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = userIdSchema.parse(req.params);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.json({ user: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users/wallet/:wallet_address - Get user by wallet address
router.get('/wallet/:wallet_address', async (req, res) => {
  try {
    const { wallet_address } = req.params;
    
    if (wallet_address.length !== 44) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', wallet_address)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.json({ user: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /users - Create new user
router.post('/', async (req, res) => {
  try {
    const userData = createUserSchema.parse(req.body);
    
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ 
          error: 'User with this username or wallet address already exists' 
        });
      }
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ user: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.issues 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = userIdSchema.parse(req.params);
    const updateData = updateUserSchema.parse(req.body);
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      if (error.code === '23505') {
        return res.status(409).json({ 
          error: 'User with this username or wallet address already exists' 
        });
      }
      return res.status(500).json({ error: error.message });
    }

    res.json({ user: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.issues 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = userIdSchema.parse(req.params);
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
