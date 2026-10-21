import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCrown, FaUserCircle, FaSignOutAlt, FaCalendarCheck, FaUserShield, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [navCollapsed, setNavCollapsed] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeNav = () => setNavCollapsed(true);

  return (
    <nav className="navbar navbar-expand-lg hp-navbar sticky-top">
      <div className="container">
        {/* Brand Logo */}
        <Link to="/" className="hp-brand" onClick={closeNav}>
          <FaCrown className="hp-brand-gold fs-4" />
          <span>
            HOTEL<span className="hp-brand-gold">PRO</span>
          </span>
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          className="navbar-toggler border-0 text-white p-2"
          type="button"
          onClick={() => setNavCollapsed(!navCollapsed)}
          aria-controls="hotelproNavbar"
          aria-expanded={!navCollapsed}
          aria-label="Toggle navigation"
        >
          {navCollapsed ? <FaBars className="fs-4 text-warning" /> : <FaTimes className="fs-4 text-warning" />}
        </button>

        {/* Navigation Items */}
        <div className={`collapse navbar-collapse ${!navCollapsed ? 'show' : ''}`} id="hotelproNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <NavLink to="/" className="nav-link hp-nav-link" end onClick={closeNav}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/rooms" className="nav-link hp-nav-link" onClick={closeNav}>
                Suites & Rooms
              </NavLink>
            </li>
            <li className="nav-item">
              <a href="/#about" className="nav-link hp-nav-link" onClick={closeNav}>
                About
              </a>
            </li>
            <li className="nav-item">
              <a href="/#services" className="nav-link hp-nav-link" onClick={closeNav}>
                Services
              </a>
            </li>
          </ul>

          {/* Right Action Buttons */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {isAuthenticated ? (
              <div className="d-flex flex-wrap align-items-center gap-2">
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-2"
                    onClick={closeNav}
                  >
                    <FaUserShield />
                    <span>Admin Portal</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/my-bookings"
                      className="btn btn-sm btn-outline-light d-flex align-items-center gap-2"
                      onClick={closeNav}
                    >
                      <FaCalendarCheck className="text-warning" />
                      <span>My Bookings</span>
                    </Link>
                    <Link
                      to="/user-home"
                      className="btn btn-sm btn-outline-warning d-flex align-items-center gap-2"
                      onClick={closeNav}
                    >
                      <FaUserCircle />
                      <span>Dashboard</span>
                    </Link>
                  </>
                )}

                <div className="text-white-50 small ps-2 border-start border-secondary d-none d-md-block">
                  <span className="text-white fw-semibold">{user?.name?.split(' ')[0]}</span>
                  {isAdmin && <span className="badge bg-warning text-dark ms-1">Admin</span>}
                </div>

                <button
                  onClick={() => {
                    closeNav();
                    handleLogout();
                  }}
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 ms-1"
                  title="Sign Out"
                >
                  <FaSignOutAlt />
                  <span className="d-lg-none">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-sm btn-outline-light px-3" onClick={closeNav}>
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-sm btn-hp-gold px-3" onClick={closeNav}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
