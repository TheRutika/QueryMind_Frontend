// src/lib/auth.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const USER_API = `${API_BASE_URL}/user`;
const WORKSPACE_API = `${API_BASE_URL}/workspace`;

// ============ Token Management ============
export const getToken = () => {
  return localStorage.getItem("authToken");
};

export const setToken = (token) => {
  localStorage.setItem("authToken", token);
};

export const removeToken = () => {
  localStorage.removeItem("authToken");
};

// ============ User Management ============
export const getCurrentUser = () => {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem("currentUser", JSON.stringify(user));
};

// ============ Authenticated API Helper ============
export const apiCall = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP Error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// ============ Authentication Endpoints ============
export const signUp = async (email, password, name) => {
  try {
    const res = await fetch(`${USER_API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: name, useremail: email, userpassword: password }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { user: null, error: text || "Registration failed" };
    }

    const data = await res.json();
    
    // Store token and user info
    if (data.token) {
      setToken(data.token);
      const user = { email, name, userID: data.userID || name };
      setCurrentUser(user);
      return { user, error: null };
    }
    
    return { user: null, error: "No token received" };
  } catch (error) {
    console.log(error);
    return { user: null, error: "Network error during registration" };
  }
};

export const signIn = async (email, password) => {
  try {
    const res = await fetch(`${USER_API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ useremail: email, userPassword: password }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { user: null, error: text || "Invalid credentials" };
    }

    const data = await res.json();
    
    // Store token and user info
    if (data.token) {
      setToken(data.token);
      const user = { email, userID: data.userID || email };
      setCurrentUser(user);
      return { user, error: null };
    }
    
    return { user: null, error: "No token received" };
  } catch (error) {
    console.error("Login error:", error);
    return { user: null, error: "Network error during login" };
  }
};

export const signOut = async () => {
  removeToken();
  localStorage.removeItem("currentUser");
};

// ============ Workspace Endpoints ============
export const getWorkspaces = async () => {
  return apiCall(`${WORKSPACE_API}/getWorkspaces`, {
    method: "GET",
  });
};

export const addWorkspace = async (workspaceData) => {
  return apiCall(`${WORKSPACE_API}/addWorkspaces`, {
    method: "POST",
    body: JSON.stringify(workspaceData),
  });
};

export const connectWorkspace = async (workspaceData) => {
  return apiCall(`${WORKSPACE_API}/connectWorkspace`, {
    method: "POST",
    body: JSON.stringify(workspaceData),
  });
};

export const fetchWorkspaceQuery = async (queryData) => {
  return apiCall(`${WORKSPACE_API}/fetchQuery`, {
    method: "POST",
    body: JSON.stringify(queryData),
  });
};
