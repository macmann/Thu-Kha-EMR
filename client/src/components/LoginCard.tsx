import React from 'react';

interface LoginCardProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  values: { username: string; password: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function LoginCard({ onSubmit, values, onChange }: LoginCardProps) {
  return (
    <div className="login-card">
      <div className="login-header">
        <div className="app-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 6v12M6 12h12" />
          </svg>
        </div>
        <h1 className="login-title">EMR System</h1>
        <p className="login-subtitle">Sign in to your account</p>
      </div>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username or Email</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={values.username}
            onChange={onChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={onChange}
          />
        </div>
        <div className="options">
          <label htmlFor="remember" className="remember">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              onChange={onChange}
            />
            <span>Remember me</span>
          </label>
          <a href="#">Forgot your password?</a>
        </div>
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
    </div>
  );
}
