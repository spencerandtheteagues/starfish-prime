/**
 * Form Validation Utilities
 */

/**
 * Validate email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password
 */
export const validatePassword = (password: string): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate phone number
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate required field
 */
export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

/**
 * Validate medication dosage
 */
export const validateDosage = (dosage: string): boolean => {
  return dosage.trim().length > 0;
};

/**
 * Validate medication time (HH:MM format)
 */
export const validateMedicationTime = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Validate blood pressure values
 */
export const validateBloodPressure = (systolic: number, diastolic: number): {
  valid: boolean;
  error?: string;
} => {
  if (systolic < 40 || systolic > 250) {
    return { valid: false, error: 'Systolic must be between 40 and 250' };
  }

  if (diastolic < 20 || diastolic > 150) {
    return { valid: false, error: 'Diastolic must be between 20 and 150' };
  }

  if (diastolic >= systolic) {
    return { valid: false, error: 'Diastolic must be less than systolic' };
  }

  return { valid: true };
};

/**
 * Validate weight
 */
export const validateWeight = (weight: number, unit: 'lbs' | 'kg'): {
  valid: boolean;
  error?: string;
} => {
  const min = unit === 'lbs' ? 50 : 23;
  const max = unit === 'lbs' ? 500 : 227;

  if (weight < min || weight > max) {
    return { valid: false, error: `Weight must be between ${min} and ${max} ${unit}` };
  }

  return { valid: true };
};

/**
 * Validate heart rate
 */
export const validateHeartRate = (heartRate: number): {
  valid: boolean;
  error?: string;
} => {
  if (heartRate < 30 || heartRate > 220) {
    return { valid: false, error: 'Heart rate must be between 30 and 220 bpm' };
  }

  return { valid: true };
};

/**
 * Validate blood sugar
 */
export const validateBloodSugar = (bloodSugar: number): {
  valid: boolean;
  error?: string;
} => {
  if (bloodSugar < 20 || bloodSugar > 600) {
    return { valid: false, error: 'Blood sugar must be between 20 and 600 mg/dL' };
  }

  return { valid: true };
};

export default {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateRequired,
  validateDosage,
  validateMedicationTime,
  validateBloodPressure,
  validateWeight,
  validateHeartRate,
  validateBloodSugar,
};
