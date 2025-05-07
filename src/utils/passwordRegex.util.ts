export class PasswordUtil {
    static checkPasswordStrength(password: string): string {
      if (!password) {
        return 'Invalid';
      }
  
      const lengthCriteria = password.length >= 8;
      const lowercaseCriteria = /[a-z]/.test(password);
      const uppercaseCriteria = /[A-Z]/.test(password);
      const digitCriteria = /\d/.test(password);
      const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
      const criteriaCount = [
        lengthCriteria,
        lowercaseCriteria,
        uppercaseCriteria,
        digitCriteria,
        specialCharCriteria,
      ].filter(Boolean).length;

      if (!lengthCriteria) {
        return 'Invalid';
      }
  
      if (criteriaCount === 5) {
        return 'Strong';
      } else if (criteriaCount >= 3) {
        return 'Medium';
      } else if (criteriaCount >= 2) {
        return 'Weak';
      } else {
        return 'Invalid';
      }
    }
  }