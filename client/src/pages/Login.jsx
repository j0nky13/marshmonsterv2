import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      // Toggle this block for real backend login when ready
      const useBackend = false;

      if (useBackend) {
        const res = await fetch('https://your-do-hosted-url.com/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        // Local dev hardcoded login
        const fakeUser = {
          id: 'local-dev-id',
          name: 'Local Dev',
          email: email,
          role: 'admin',
          token: 'dev-token'
        };
        localStorage.setItem('token', fakeUser.token);
        localStorage.setItem('user', JSON.stringify(fakeUser));
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="bg-[#121212] text-white min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1f1f1f] p-8 rounded-lg shadow-lg border border-gray-700">
        <h1 className="text-2xl font-bold text-lime-400 mb-6 text-center">Admin Login</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full bg-[#1e1e1e] border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-lime-400"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#1e1e1e] border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-lime-400"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-lime-400 hover:bg-lime-300 text-black font-semibold py-3 px-6 rounded transition"
          >
            Log In
          </button>
        </form>
      </div>
    </section>
  );
}