import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword, login, resetPassword } from '../api';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await login(email, password);
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReset = async (e) => {
    e.preventDefault();
    setError('');
    setResetCode('');
    setNewPassword('');
    setCodeLoading(true);
    try {
      const resp = await forgotPassword(email);
      if (!resp?.success && resp?.message) throw new Error(resp.message);
      setResetCode(resp.resetToken);
    } catch (err) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetLoading(true);
    try {
      await resetPassword(email, resetCode, newPassword);
      setMode('login');
      setResetCode('');
      setNewPassword('');
      setPassword('');
      setError('Password updated. Please sign in.');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Gym Admin</h1>
        <p className="login-sub">
          {mode === 'login' ? 'Sign in to manage members and plans' : 'Reset your password'}
        </p>

        {mode === 'login' ? (
          <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gym.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="login-footer">
            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                setResetCode('');
                setNewPassword('');
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#C6F135',
                cursor: 'pointer',
                fontSize: '0.95rem',
                textDecoration: 'underline',
              }}
            >
              Forgot password?
            </button>
          </p>
          <p className="login-footer">
            New gym? <Link to="/signup">Sign up</Link>
          </p>
        </form>
        ) : (
          <form onSubmit={handleSendReset}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gym.com"
                required
                autoComplete="email"
              />
            </div>

            {resetCode ? (
              <>
                <div className="form-group">
                  <label>Reset code</label>
                  <input
                    type="text"
                    value={resetCode}
                    readOnly
                    onChange={(e) => setResetCode(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    autoComplete="new-password"
                  />
                </div>

                {error && <p className="login-error">{error}</p>}
                <button type="button" className="btn btn-primary login-btn" disabled={resetLoading || !newPassword.trim()} onClick={handleResetPassword}>
                  {resetLoading ? 'Resetting...' : 'Reset password'}
                </button>
                <p className="login-footer">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setResetCode('');
                      setNewPassword('');
                      setError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#C6F135',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      textDecoration: 'underline',
                    }}
                  >
                    Back to sign in
                  </button>
                </p>
              </>
            ) : (
              <>
                {error && <p className="login-error">{error}</p>}
                <button type="submit" className="btn btn-primary login-btn" disabled={codeLoading}>
                  {codeLoading ? 'Sending...' : 'Send reset code'}
                </button>
                <p className="login-footer">
                  Enter your email, then use the reset code returned here.
                </p>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
