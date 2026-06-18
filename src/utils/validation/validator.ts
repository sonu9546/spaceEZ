// ===========================================================
// Password validation
// ===========================================================
export const validatePassword = (_: unknown, value: string) => {
  const val = value?.trim() || '';

  if (!val) return Promise.reject(new Error('Please enter your password.'));
  if (val.length < 8) return Promise.reject(new Error('Minimum 8 characters.'));
  if (!/[A-Z]/.test(val)) return Promise.reject(new Error('One uppercase required.'));
  if (!/[a-z]/.test(val)) return Promise.reject(new Error('One lowercase required.'));
  if (!/[0-9]/.test(val)) return Promise.reject(new Error('One number required.'));
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(val))
    return Promise.reject(new Error('One special character required.'));

  return Promise.resolve();
};

// ===========================================================
// Email validation
// ===========================================================
export const validateEmail = (_: unknown, value: string) => {
  if (!value) return Promise.reject(new Error('Enter email!'));

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(value)
    ? Promise.resolve()
    : Promise.reject(new Error('Please enter a valid email address!'));
};
