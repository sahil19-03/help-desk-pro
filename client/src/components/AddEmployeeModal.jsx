// Admin-only modal: create a new user account.
// Replaces the removed public sign-up form — only admins can provision accounts.

import React, { useState } from 'react';
import { apiFetch } from '../api.js';

const initialForm = { name: '', email: '', password: '', role: 'employee' };

export default function AddEmployeeModal({ onCreated, onClose }) {
  const [form,         setForm]         = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');
  const [busy,         setBusy]         = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);

    try {
      const res    = await apiFetch('/admin/users', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.message ?? 'Could not create account.');
      } else {
        setSuccess(`✓ Account created for ${result.name} (${result.email})`);
        setForm(initialForm);
        onCreated?.(result);
      }
    } catch {
      setError('Server unavailable. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>

        <div className="modal-header">
          <strong>Add new account</strong>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#718078' }}>
          Create a login for a new employee, engineer, or admin. They will sign in with the email and password you set here.
        </p>

        {error   && <div className="message" style={{ marginBottom: 12 }}>{error}</div>}
        {success && <div className="message" style={{ borderLeftColor: '#70a984', marginBottom: 12 }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 10, fontSize: 12, fontWeight: 700, color: '#46534b' }}>
            Full name
            <input
              required
              type="text"
              value={form.name}
              placeholder="e.g. Priya Kapoor"
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', border: '1px solid #ccd8cf', borderRadius: 3, fontSize: 13, fontFamily: 'inherit' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: 10, fontSize: 12, fontWeight: 700, color: '#46534b' }}>
            Work email
            <input
              required
              type="email"
              value={form.email}
              placeholder="e.g. priya@company.com"
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', border: '1px solid #ccd8cf', borderRadius: 3, fontSize: 13, fontFamily: 'inherit' }}
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#46534b' }}>
              Temporary password
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: 6 }}>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  placeholder="Min 8 chars"
                  minLength={8}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ display: 'block', width: '100%', margin: 0, padding: '10px 36px 10px 12px', border: '1px solid #ccd8cf', borderRadius: 3, fontSize: 13, fontFamily: 'inherit' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{
                    position: 'absolute',
                    right: 6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 'auto',
                    margin: 0,
                    padding: 4,
                    background: 'transparent',
                    border: 'none',
                    color: '#839188',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'none'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <label style={{ fontSize: 12, fontWeight: 700, color: '#46534b' }}>
              Role
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', border: '1px solid #ccd8cf', borderRadius: 3, fontSize: 13, fontFamily: 'inherit', background: '#fbfcfa' }}
              >
                <option value="employee">Employee</option>
                <option value="engineer">Engineer</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              type="submit"
              disabled={busy}
              style={{ flex: 1, padding: '11px 14px', background: '#173f32', color: '#f4f8e9', border: 'none', borderRadius: 3, fontWeight: 700, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1 }}
            >
              {busy ? 'Creating...' : 'Create account'} {!busy && <span>→</span>}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '11px 14px', background: '#f0f4f0', color: '#46534b', border: '1px solid #dfe6df', borderRadius: 3, fontWeight: 700, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
