export const signUp = async (email, password, name) => {
  const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
  if (existingUsers.find((u) => u.email === email)) {
    return { user: null, error: 'User already exists' };
  }

  const user = {
    id: crypto.randomUUID(),
    email,
    name,
  };

  existingUsers.push(user);
  localStorage.setItem('users', JSON.stringify(existingUsers));
  localStorage.setItem('currentUser', JSON.stringify(user));

  return { user, error: null };
};

export const signIn = async (email, password) => {
  const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
  const user = existingUsers.find((u) => u.email === email);

  if (!user) {
    return { user: null, error: 'Invalid credentials' };
  }

  localStorage.setItem('currentUser', JSON.stringify(user));
  return { user, error: null };
};

export const signOut = async () => {
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};
