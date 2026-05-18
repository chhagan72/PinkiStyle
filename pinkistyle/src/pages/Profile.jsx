// src/pages/Profile.jsx
// src/pages/Profile.jsx
import React, { useEffect, useState, useRef } from 'react';
import { auth } from "../utils/auth";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);

  const API_BASE = 'http://localhost:5000';

  function getToken() {
    return auth.getToken();
  }

  async function fetchMe() {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/me`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      setUser(data);
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        address: data.address || '',
      });
    } catch (e) {
      setMsg(e.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          address: form.address,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setUser(data.user);
      setMsg('Profile updated successfully ✅');
    } catch (e) {
      setMsg(e.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function onFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setMsg('');
    const fd = new FormData();
    fd.append('avatar', file);

    try {
      const res = await fetch(`${API_BASE}/api/me/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Avatar upload failed');

      setUser(data.user);
      setMsg('Profile photo updated 🎉');
      if (fileRef.current) fileRef.current.value = '';
    } catch (e) {
      setMsg(e.message || 'Avatar upload failed');
    }
  }

  const initials = `${form.firstName?.[0] || ''}${form.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="container py-4">
      {/* Local CSS */}
      <style>{`
        .fade-in-up { animation: fadeInUp .6s ease both; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate3d(0, 10px, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.75rem 2rem rgba(0,0,0,.08) !important;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .avatar {
          width: 140px; height: 140px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 6px 18px rgba(0,0,0,.15);
        }
        .avatar-fallback {
          width: 140px; height: 140px;
          border-radius: 50%;
          display: grid; place-items: center;
          background: linear-gradient(135deg, #f0f3ff, #e6f7ff);
          color: #2b3a67; font-weight: 700; font-size: 2rem;
          box-shadow: 0 6px 18px rgba(0,0,0,.12);
        }
        .btn-soft {
          background: #f6f7fb;
          border: 1px solid #eef0f5;
        }
        .btn-soft:hover { background: #eef0f5; }
        .label-mute { font-size: .85rem; color: #6c757d; }
      `}</style>

      <div className="row g-4">
        {/* Left Column: Avatar */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm fade-in-up card-hover">
            <div className="card-body text-center p-4">
              <div className="mb-3 d-flex justify-content-center">
                {user?.avatarUrl ? (
                  <img
                    src={`${API_BASE}${user.avatarUrl}`}
                    alt="Avatar"
                    className="avatar"
                  />
                ) : (
                  <div className="avatar-fallback">{initials || '👤'}</div>
                )}
              </div>

              <div className="d-grid gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={onFileSelect}
                />
                <small className="text-muted">PNG/JPG/WebP/GIF up to 3MB</small>
              </div>

              <div className="mt-3">
                <h5 className="mb-0">{form.firstName || '—'} {form.lastName || ''}</h5>
                <div className="text-muted">{user?.email || ''}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm fade-in-up card-hover">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="mb-0">Profile</h4>
                {loading && <span className="badge text-bg-secondary">Loading…</span>}
              </div>

              {msg.text && (
                <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>
              )}

              <form onSubmit={onSave}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label label-mute">First Name</label>
                    <input
                      className="form-control"
                      name="firstName"
                      value={form.firstName}
                      onChange={onChange}
                      placeholder="First name"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label label-mute">Last Name</label>
                    <input
                      className="form-control"
                      name="lastName"
                      value={form.lastName}
                      onChange={onChange}
                      placeholder="Last name"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label label-mute">Mobile (read-only)</label>
                    <input className="form-control" value={user?.mobile || ''} disabled />
                  </div>

                  <div className="col-12">
                    <label className="form-label label-mute">Email (read-only)</label>
                    <input className="form-control" value={user?.email || ''} disabled />
                  </div>

                  <div className="col-12">
                    <label className="form-label label-mute">Address</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      name="address"
                      value={form.address}
                      onChange={onChange}
                      placeholder="Your address"
                    />
                  </div>

                  <div className="col-12 d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Updating…' : 'Update Profile'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-soft"
                      onClick={fetchMe}
                      disabled={loading}
                      title="Reset unsaved changes"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </form>

              {/* Summary */}
              <hr className="my-4" />
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="p-3 rounded bg-light">
                    <div className="label-mute">Name</div>
                    <div className="fw-semibold">{form.firstName || '—'} {form.lastName || ''}</div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-3 rounded bg-light">
                    <div className="label-mute">Contact</div>
                    <div className="fw-semibold">{user?.mobile || '—'}</div>
                    <div className="text-muted small">{user?.email || ''}</div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-3 rounded bg-light">
                    <div className="label-mute">Address</div>
                    <div className="fw-semibold">{form.address || '—'}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
