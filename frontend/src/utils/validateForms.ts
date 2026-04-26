export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validatePhone = (phone: string): boolean => {
  const re = /^[0-9+\-\s()]{10,15}$/;
  return re.test(phone);
};
