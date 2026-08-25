// Sign-in only. No public self-registration.
// New accounts are created by an admin from the Admin panel.

import React from 'react';
import { API } from '../api.js';

export default function LoginScreen({ form, error, onSubmit, onChange }) {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand"><span className="logo">H</span><strong>HelpDesk Pro</strong></div>
        <p className="eyebrow">EMPLOYEE ACCESS</p>
        <h1>Welcome back.</h1>
        <span className="helper">
          Sign in to view your tickets and raise a new request.
          <br />
          <small style={{ color: '#9aaa9e' }}>Don't have an account? Contact your IT admin.</small>
        </span>

        {error && <div className="message">{error}</div>}

        <a className="google-button" href={`${API}/auth/google`}>
          <span className="google-mark">G</span>Continue with Google
        </a>

        <div className="auth-divider"><span>or use your email</span></div>

        <form onSubmit={onSubmit}>
          <label>Email
            <input
              required
              type="email"
              value={form.email}
              autoComplete="email"
              onChange={e => onChange({ ...form, email: e.target.value })}
            />
          </label>
          <label>Password
            <input
              required
              type="password"
              value={form.password}
              autoComplete="current-password"
              onChange={e => onChange({ ...form, password: e.target.value })}
            />
          </label>
          <button type="submit">Sign in <span>-&gt;</span></button>
        </form>
      </section>
    </main>
  );
}
