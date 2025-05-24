import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

type PasswordValidationResult = {
  isValid: boolean;
  score: number;
  feedback: {
    suggestions: string[];
    warning: string;
  };
};

export const validatePassword = (password: string): PasswordValidationResult => {
  // Configure zxcvbn with English language pack
  const options = {
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary,
    },
  };
  
  zxcvbnOptions.setOptions(options);
  
  // Minimum password requirements
  const minLength = 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= minLength;
  
  // Check against zxcvbn
  const result = zxcvbn(password);
  
  // Calculate if password meets all requirements
  const meetsRequirements = hasUppercase && 
                          hasLowercase && 
                          hasNumber && 
                          hasSpecialChar && 
                          isLongEnough &&
                          result.score >= 2; // At least 'somewhat guessable'
  
  // Generate feedback
  const feedback = {
    suggestions: [],
    warning: '',
  };
  
  if (!hasUppercase) {
    feedback.suggestions.push('Include at least one uppercase letter');
  }
  
  if (!hasLowercase) {
    feedback.suggestions.push('Include at least one lowercase letter');
  }
  
  if (!hasNumber) {
    feedback.suggestions.push('Include at least one number');
  }
  
  if (!hasSpecialChar) {
    feedback.suggestions.push('Include at least one special character');
  }
  
  if (!isLongEnough) {
    feedback.suggestions.push(`Use at least ${minLength} characters`);
  }
  
  if (result.feedback.warning) {
    feedback.warning = result.feedback.warning;
  } else if (result.score < 2) {
    feedback.warning = 'This password is too weak';
  }
  
  return {
    isValid: meetsRequirements,
    score: result.score,
    feedback,
  };
};

export const isCommonPassword = async (password: string): Promise<boolean> => {
  try {
    // This is a placeholder for a real API call to check against common passwords
    // In a real app, you would make an API call to your backend which would check
    // against a database of common passwords or use a service like Have I Been Pwned
    const commonPasswords = [
      'password', '123456', 'qwerty', 'letmein', '123456789',
      // Add more common passwords as needed
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  } catch (error) {
    console.error('Error checking common password:', error);
    // Fail open - don't block the user if the check fails
    return false;
  }
};
