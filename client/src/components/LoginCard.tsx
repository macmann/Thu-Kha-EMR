import React from 'react';

interface LoginCardProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  values: { username: string; password: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function LoginCard({ onSubmit, values, onChange }: LoginCardProps) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow">
      <div className="mb-6 flex flex-col items-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-white"
          >
            <path d="M12 6v12M6 12h12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">EMR System</h1>
        <p className="mt-1 text-sm text-gray-600">Sign in to your account</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username or Email
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={values.username}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="remember" className="flex items-center text-sm text-gray-700">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              onChange={onChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2">Remember me</span>
          </label>
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Forgot your password?
          </a>
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Login
        </button>
      </form>
    </div>
  );
}
