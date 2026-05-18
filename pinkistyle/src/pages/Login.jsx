// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../utils/auth";

export default function Login({ setIsLoggedIn, setUser, t }) {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrMobile, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // safe user (remove password before storing client-side)
        const safeUser = data.user
          ? (({ password: _p, ...rest }) => rest)(data.user)
          : null;

        // store session (tab-scoped)
        auth.setToken(data.token);
        auth.setRole(data.role || "user");
        if (safeUser) auth.setUser(safeUser);

        // update parent state
        setIsLoggedIn(true);
        if (setUser) setUser(safeUser);

        // navigate based on role
        if (data.role === "admin") navigate("/admin");
        else navigate("/home");
      } else {
        setErr(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErr("Server error. Please try again later.");
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <h2 className="mb-4 text-center">{t?.loginTitle || "Login"}</h2>

      {err && <div className="alert alert-danger">{err}</div>}

      <form onSubmit={handleLogin}>
        <input
          className="form-control mb-3"
          placeholder={t?.emailOrMobile || "Email or Mobile"}
          value={emailOrMobile}
          onChange={(e) => setEmailOrMobile(e.target.value)}
          required
        />
        <input
          className="form-control mb-3"
          type="password"
          placeholder={t?.password || "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn btn-primary w-100"> {t?.loginBtn || "Login"} </button>
      </form>

      <p className="mt-3 text-center">
        {t?.noAccount || "Don't have an account?"} <Link to="/register">{t?.registerHere || "Register"}</Link>
      </p>
    </div>
  );
}
