// src/utils/auth.js
export const auth = {
  // Token
  getToken: () => sessionStorage.getItem("token"),
  setToken: (token) => sessionStorage.setItem("token", token),
  clearToken: () => sessionStorage.removeItem("token"),

  // Role
  getRole: () => sessionStorage.getItem("role"),
  setRole: (role) => sessionStorage.setItem("role", role),
  clearRole: () => sessionStorage.removeItem("role"),

  // User (JSON)
  getUser: () => {
    try {
      const raw = sessionStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
  setUser: (userObj) => sessionStorage.setItem("user", JSON.stringify(userObj)),
  clearUser: () => sessionStorage.removeItem("user"),

  // Clear all
  clearAll: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("user");
  },
};
