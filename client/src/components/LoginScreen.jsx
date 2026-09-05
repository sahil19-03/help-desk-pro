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

        <a className="google-button" href={`${API}/auth/google`} id="google-signin-btn">
          <svg width="18" height="18" viewBox="0 0 48 48" style={{flexShrink:0}}>
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.1 33.8 29.6 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.8 0 20-7.8 20-21 0-1.4-.1-2.7-.5-4z"/>
            <path fill="#34A853" d="M6.3 14.7l7 5.1C15.2 16.5 19.3 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.5 3 24 3c-7.7 0-14.3 4.6-17.7 11.7z"/>
            <path fill="#FBBC05" d="M24 45c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.6 36.4 26.9 37 24 37c-5.6 0-10.3-3.4-12-8.2l-7 5.4C8.2 40.6 15.5 45 24 45z"/>
            <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-1.1 3-3.5 5.4-6.5 6.9l6.5 5.3c3.8-3.5 6.2-8.8 6.2-15.7 0-1.4-.1-2.7-.5-4z"/>
          </svg>
          Continue with Google
        </a>

        <div className="auth-divider"><span>or sign in with email</span></div>

        <form onSubmit={onSubmit}>
          <label htmlFor="login-email">Email
            <input
              id="login-email"
              required
              type="email"
              value={form.email}
              autoComplete="email"
              placeholder="you@company.com"
              onChange={e => onChange({ ...form, email: e.target.value })}
            />
          </label>
          <label htmlFor="login-password">Password
            <input
              id="login-password"
              required
              type="password"
              value={form.password}
              autoComplete="current-password"
              placeholder="••••••••"
              onChange={e => onChange({ ...form, password: e.target.value })}
            />
          </label>
          <button type="submit" id="signin-btn">Sign in &nbsp;→</button>
        </form>
      </section>
    </main>
  );
}
