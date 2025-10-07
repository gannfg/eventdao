// Shared validation utilities

export const isValidSolanaAddress = (address: string): boolean => {
  try {
    // Basic validation - Solana addresses are base58 encoded and 32-44 characters long
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    return base58Regex.test(address) && address.length >= 32 && address.length <= 44;
  } catch {
    return false;
  }
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
};

export const validateEventForm = (formData: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.title || formData.title.trim().length < 3) {
    errors.push('Event title must be at least 3 characters long');
  }

  if (!formData.description || formData.description.trim().length < 10) {
    errors.push('Event description must be at least 10 characters long');
  }

  if (!formData.category) {
    errors.push('Please select a category');
  }

  if (!formData.eventDate) {
    errors.push('Please select an event date');
  } else if (!isValidDate(formData.eventDate)) {
    errors.push('Please enter a valid date');
  } else if (!isFutureDate(formData.eventDate)) {
    errors.push('Event date must be in the future');
  }

  if (!formData.location || formData.location.trim().length < 3) {
    errors.push('Please enter a valid location');
  }

  if (!formData.bondAmount || formData.bondAmount < 0.1) {
    errors.push('Bond amount must be at least 0.1 SOL');
  }

  if (formData.eventUrl && !isValidUrl(formData.eventUrl)) {
    errors.push('Please enter a valid URL');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
