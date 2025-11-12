// src/lib/auth.js

const API_BASE_URL = "http://localhost:8080/user";

export const signUp = async (email, password, name) => {
  try {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: name, useremail: email, userpassword: password }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { user: null, error: text || "Registration failed" };
    }

    const data = await res.json();
    return { user: data.user || data, error: null };
  } catch (error) {
    console.log(error)
    return { user: null, error: "Network error during registration" };
  }
};

export const signIn = async (email, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ useremail: email, userPassword: password }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { user: null, error: text || "Invalid credentials" };
    }

    const data = await res.json();
    return { user: data.user || data, error: null };
  } catch (error) {
    return { user: null, error: "Network error during login" };
  }
};

export const signOut = async () => {
  localStorage.removeItem("currentUser");
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
};
