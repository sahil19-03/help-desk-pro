// Sign-in only. No public self-registration.
// New accounts are created by an admin from the Admin panel.
//
// Two login modes:
//   Employee — for employees (role: employee)
//   Engineer — for engineers AND admins (role: engineer | admin)
//   Both tabs support Google sign-in and email/password.

import React, { useState } from 'react';
import { API } from '../api.js';

export default function LoginScreen({ form, error, onSubmit, onChange }) {
  const [mode, setMode] = useState('employee'); // 'employee' | 'engineer'
  const [showPassword, setShowPassword] = useState(false);
  const isEngineer = mode === 'engineer';

  return (
    <main className="auth-page">
      <section className="auth-panel">

        {/* Brand */}
        <div className="brand" style={{ marginBottom: 28 }}>
          <span className="logo">H</span>
          <strong>HelpDesk Pro</strong>
        </div>

        {/* Mode toggle */}
        <div className="login-mode-toggle" role="tablist" aria-label="Login type">
          <button
            role="tab"
            type="button"
            aria-selected={!isEngineer}
            className={`mode-tab${!isEngineer ? ' active' : ''}`}
            onClick={() => setMode('employee')}
            id="tab-employee"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Employee
          </button>
          <button
            role="tab"
            type="button"
            aria-selected={isEngineer}
            className={`mode-tab${isEngineer ? ' active engineer' : ''}`}
            onClick={() => setMode('engineer')}
            id="tab-engineer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
              <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            </svg>
            Engineer
          </button>
          <span className={`mode-indicator${isEngineer ? ' right' : ''}`} aria-hidden="true" />
        </div>

        {/* Header text per mode */}
        {isEngineer ? (
          <>
            <p className="eyebrow" style={{ color: '#2a5ea8' }}>ENGINEER &amp; ADMIN ACCESS</p>
            <h1 style={{ color: '#0f2545' }}>Team portal.</h1>
            <span className="helper" style={{ marginBottom: 18, display: 'block' }}>
              Sign in to manage your team queue and resolve tickets.
              <br />
              <small style={{ color: '#9aaa9e' }}>For IT engineers and system administrators.</small>
            </span>
          </>
        ) : (
          <>
            <p className="eyebrow">EMPLOYEE ACCESS</p>
            <h1>Welcome back.</h1>
            <span className="helper" style={{ marginBottom: 18, display: 'block' }}>
              Sign in to view your tickets and raise a new request.
              <br />
              <small style={{ color: '#9aaa9e' }}>Don't have an account? Contact your IT admin.</small>
            </span>
          </>
        )}

        {/* Error message */}
        {error && (
          <div className={`message${isEngineer ? ' message-engineer' : ''}`}>{error}</div>
        )}

        {/* Google sign-in — shown on both tabs */}
        <a
          className={`google-button${isEngineer ? ' google-button-engineer' : ''}`}
          href={`${API}/auth/google`}
          id="google-signin-btn"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" style={{flexShrink:0}}>
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.1 33.8 29.6 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.8 0 20-7.8 20-21 0-1.4-.1-2.7-.5-4z"/>
            <path fill="#34A853" d="M6.3 14.7l7 5.1C15.2 16.5 19.3 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.5 3 24 3c-7.7 0-14.3 4.6-17.7 11.7z"/>
            <path fill="#FBBC05" d="M24 45c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.6 36.4 26.9 37 24 37c-5.6 0-10.3-3.4-12-8.2l-7 5.4C8.2 40.6 15.5 45 24 45z"/>
            <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-1.1 3-3.5 5.4-6.5 6.9l6.5 5.3c3.8-3.5 6.2-8.8 6.2-15.7 0-1.4-.1-2.7-.5-4z"/>
          </svg>
          Continue with Google
        </a>

        <div className="auth-divider"><span>or sign in with email</span></div>

        {/* Email / password form — shown on both tabs */}
        <form onSubmit={e => onSubmit(e, mode)}>
          <label htmlFor="login-email">Email
            <input
              id="login-email"
              required
              type="email"
              value={form.email}
              autoComplete="email"
              placeholder={isEngineer ? 'engineer@company.com' : 'you@company.com'}
              onChange={e => onChange({ ...form, email: e.target.value })}
            />
          </label>
          <label htmlFor="login-password">Password
            <div className="password-input-wrapper">
              <input
                id="login-password"
                required
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                autoComplete="current-password"
                placeholder="••••••••"
                onChange={e => onChange({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>
          <button
            type="submit"
            id="signin-btn"
            className={`signin-submit-btn ${isEngineer ? 'engineer-btn' : ''}`}
          >
            <span>Sign in</span>
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </button>
        </form>
      </section>
    </main>
  );
}
