import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCrown, FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Please complete all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(formData);
      if (res?.user) {
        navigate('/user-home');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
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
          <div className="col-lg-6 col-md-8">
            <div className="hp-glass-panel p-4 p-md-5 shadow-lg border border-warning border-opacity-25">
              {/* Header */}
              <div className="text-center mb-4">
                <Link to="/" className="hp-brand justify-content-center text-dark mb-2">
                  <FaCrown className="text-warning fs-3" />
                  <span className="fs-3 fw-bold">
                    HOTEL<span className="text-warning">PRO</span>
                  </span>
                </Link>
                <h4 className="fw-bold hp-serif text-dark mt-2 mb-1">Create Member Account</h4>
                <p className="text-muted small">
                  Register to unlock member rates, express check-in, and reservation management.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger small p-2 mb-3" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                    Full Name
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <FaUser />
                    </span>
                    <input
                      type="text"
                      name="name"
                      className="form-control bg-light border-start-0"
                      placeholder="e.g. Lady Evelyn Montgomery"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Email Address */}
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
                      name="email"
                      className="form-control bg-light border-start-0"
                      placeholder="e.g. evelyn@example.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Telephone */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                    Phone Number
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <FaPhone />
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control bg-light border-start-0"
                      placeholder="+1 (555) 234-5678"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                    Password (Min 6 Characters)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <FaLock />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="form-control bg-light border-start-0 border-end-0"
                      placeholder="••••••••"
                      required
                      value={formData.password}
                      onChange={handleChange}
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

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                    Confirm Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <FaLock />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      className="form-control bg-light border-start-0"
                      placeholder="••••••••"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-hp-gold btn-lg w-100 mb-3"
                >
                  {loading ? 'Creating Member Account...' : 'Complete Registration'}
                </button>
              </form>

              <div className="text-center text-muted small">
                Already have an account?{' '}
                <Link to="/login" className="text-warning fw-bold text-decoration-none hover-gold">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
