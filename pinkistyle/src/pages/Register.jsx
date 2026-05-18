import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register({ t }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    address: "",
    password: ""
  });
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      navigate("/login");
    } else {
      alert(data.message);
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <h2>{t.registerTitle}</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          name="firstName"
          placeholder={t.firstName}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-2"
          name="lastName"
          placeholder={t.lastName}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-2"
          name="mobile"
          placeholder={t.mobile}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-2"
          type="email"
          name="email"
          placeholder={t.email}
          onChange={handleChange}
          required
        />
        <textarea
          className="form-control mb-2"
          name="address"
          placeholder={t.address}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-2"
          type="password"
          name="password"
          placeholder={t.password}
          onChange={handleChange}
          required
        />
        <button className="btn btn-primary w-100">{t.registerBtn}</button>
      </form>
      <p className="mt-3">
        {t.haveAccount} <Link to="/login">{t.loginHere}</Link>
      </p>
    </div>
  );
}
