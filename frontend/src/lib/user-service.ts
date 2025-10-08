const API_BASE_URL = 'http://localhost:4000/api';

export interface User {
  id: string;
  username: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  username: string;
  wallet_address: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class UserService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserByWallet(walletAddress: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/wallet/${walletAddress}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // User not found
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.user;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('User not found'))) {
        return null;
      }
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.makeRequest<{ user: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.user;
  }

  async updateUser(id: string, userData: Partial<CreateUserRequest>): Promise<User> {
    const response = await this.makeRequest<{ user: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.user;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.makeRequest<{ users: User[] }>('/users');
    return response.users;
  }
}

export const userService = new UserService();
