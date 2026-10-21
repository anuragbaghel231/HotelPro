import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCrown, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email, password);
      if (res?.user) {
        if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(from || '/user-home');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@hotelpro.com');
      setPassword('Admin@12345');
    } else {
      setEmail('customer@hotelpro.com');
      setPassword('Customer@12345');
    }
    setError('');
  };

  return (
    <div
      className="py-5 d-flex align-items-center"
      style={{
        minHeight: '85vh',
        background: 'linear-gradient(135deg, #070d1d 0%, #101f42 100%)'
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="hp-glass-panel p-4 p-md-5 shadow-lg border border-warning border-opacity-25">
              {/* Logo / Header */}
              <div className="text-center mb-4">
                <Link to="/" className="hp-brand justify-content-center text-dark mb-2">
                  <FaCrown className="text-warning fs-3" />
                  <span className="fs-3 fw-bold">
                    HOTEL<span className="text-warning">PRO</span>
                  </span>
                </Link>
                <h4 className="fw-bold hp-serif text-dark mt-2 mb-1">Welcome Back</h4>
                <p className="text-muted small">Sign in to manage your luxury hotel reservations.</p>
              </div>

              {error && (
                <div className="alert alert-danger small p-2 mb-3" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                    Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <FaEnvelope />
                    </span>
                    <input
                      type="email"
                      className="form-control bg-light border-start-0"
                      placeholder="e.g. guest@hotelpro.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Field with visibility toggle */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                    Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <FaLock />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control bg-light border-start-0 border-end-0"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="input-group-text bg-light border-start-0 text-muted"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-hp-gold btn-lg w-100 mb-3"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              {/* Demo Fill Helper Buttons for Easy Testing */}
              <div className="p-3 bg-light rounded-3 mb-4 border border-light-subtle">
                <small className="text-muted d-block text-uppercase fw-bold mb-2 text-center">
                  Quick Demo Credentials:
                </small>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('customer')}
                    className="btn btn-outline-secondary btn-sm flex-fill"
                  >
                    Customer Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('admin')}
                    className="btn btn-outline-warning btn-sm flex-fill text-dark fw-bold"
                  >
                    Admin Demo
                  </button>
                </div>
              </div>

              <div className="text-center text-muted small">
                Don't have an account yet?{' '}
                <Link to="/signup" className="text-warning fw-bold text-decoration-none hover-gold">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
