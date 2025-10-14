import { supabase } from './supabase';

export interface User {
  id: string;
  username: string;
  wallet_address: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  username: string;
  wallet_address: string;
  avatar_url?: string;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class UserService {
  async getUserByWallet(walletAddress: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('User not found'))) {
        return null;
      }
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('User with this username or wallet address already exists');
      }
      throw new Error(error.message);
    }

    return data;
  }

  async updateUser(id: string, userData: Partial<CreateUserRequest>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('User not found');
      }
      if (error.code === '23505') {
        throw new Error('User with this username or wallet address already exists');
      }
      throw new Error(error.message);
    }

    return data;
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Provide more specific error messages
        if (uploadError.message.includes('not found') || uploadError.message.includes('does not exist')) {
          throw new Error('Avatars storage bucket not found. Please create the "avatars" bucket in your Supabase dashboard: Storage → Create bucket → Name: "avatars" → Public: true');
        }
        if (uploadError.message.includes('row-level security policy')) {
          throw new Error('Storage upload blocked by security policies. Please set up RLS policies for the avatars bucket. See the setup guide for instructions.');
        }
        throw new Error(`Failed to upload avatar: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded avatar');
      }

      // Update user record with new avatar URL
      const { data: userData, error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update user avatar: ${updateError.message}`);
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  }

  async deleteAvatar(userId: string, avatarUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `avatars/${fileName}`;

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) {
        console.warn('Failed to delete old avatar from storage:', deleteError.message);
        // Don't throw error here as the main operation (updating user) might still succeed
      }

      // Update user record to remove avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) {
        throw new Error(`Failed to remove avatar from user: ${updateError.message}`);
      }
    } catch (error) {
      console.error('Avatar deletion error:', error);
      throw error;
    }
  }

}

export const userService = new UserService();
