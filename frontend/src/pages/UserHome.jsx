import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import {
  FaUser,
  FaCalendarCheck,
  FaSearch,
  FaBed,
  FaDollarSign,
  FaCompass,
  FaSignOutAlt,
  FaClock,
  FaArrowRight
} from 'react-icons/fa';

const UserHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick search bar state
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState('2');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [bookingsRes, roomsRes] = await Promise.all([
          api.get('/bookings/my'),
          api.get('/rooms')
        ]);

        if (bookingsRes.data?.success) {
          setBookings(bookingsRes.data.bookings);
        }
        if (roomsRes.data?.success) {
          setAvailableRooms(roomsRes.data.rooms.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load user dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    navigate(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&capacity=${guests}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Find next upcoming confirmed reservation
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.checkIn) >= new Date()
  );
  const nextTrip = upcomingBookings.length > 0 ? upcomingBookings[0] : null;

  const totalSpent = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  if (loading) {
    return <LoadingSpinner fullPage={true} message="Loading your personal concierge portal..." />;
  }

  return (
    <div className="py-5">
      <div className="container">
        {/* Welcome Banner */}
        <div className="hp-glass-panel p-4 p-md-5 mb-5 position-relative overflow-hidden">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <span className="badge bg-warning text-dark text-uppercase fw-bold mb-2">
                Customer Concierge Portal
              </span>
              <h1 className="display-6 fw-bold hp-serif text-dark mb-2">
                Welcome, {user?.name || 'Valued Guest'}
              </h1>
              <p className="text-secondary mb-4">
                Manage your bespoke reservations, track your upcoming luxury stays, and explore
                exclusive member suites.
              </p>

              <div className="d-flex flex-wrap gap-2">
                <Link to="/my-bookings" className="btn btn-hp-gold btn-sm">
                  <FaCalendarCheck className="me-1" /> View My Bookings ({bookings.length})
                </Link>
                <Link to="/rooms" className="btn btn-hp-navy btn-sm">
                  <FaCompass className="me-1" /> Browse All Suites
                </Link>
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                  <FaSignOutAlt className="me-1" /> Sign Out
                </button>
              </div>
            </div>

            <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
              <div className="p-3 bg-light rounded-4 border border-light-subtle d-inline-block text-start">
                <small className="text-muted d-block text-uppercase fw-bold">Primary Account</small>
                <div className="fw-bold text-dark">{user?.email}</div>
                <div className="small text-muted">{user?.phone}</div>
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 mt-2">
                  Verified Member
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Metrics Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="kpi-stat-card">
              <div>
                <small className="text-muted text-uppercase fw-bold">Total Reservations</small>
                <h2 className="fw-bold text-dark mt-1 mb-0">{bookings.length}</h2>
              </div>
              <div className="kpi-icon-box bg-primary bg-opacity-10 text-primary">
                <FaCalendarCheck />
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="kpi-stat-card">
              <div>
                <small className="text-muted text-uppercase fw-bold">Upcoming Stays</small>
                <h2 className="fw-bold text-dark mt-1 mb-0">{upcomingBookings.length}</h2>
              </div>
              <div className="kpi-icon-box bg-success bg-opacity-10 text-success">
                <FaBed />
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="kpi-stat-card">
              <div>
                <small className="text-muted text-uppercase fw-bold">Total Stay Investment</small>
                <h2 className="fw-bold text-dark mt-1 mb-0">${totalSpent}</h2>
              </div>
              <div className="kpi-icon-box bg-warning bg-opacity-10 text-warning">
                <FaDollarSign />
              </div>
            </div>
          </div>
        </div>

        {/* Next Upcoming Reservation Spotlight */}
        {nextTrip && (
          <div className="hp-card p-4 mb-5 border-start border-warning border-4 shadow-sm">
            <div className="row g-4 align-items-center">
              <div className="col-md-3">
                <img
                  src={
                    nextTrip.room?.images?.[0] ||
                    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={nextTrip.room?.name}
                  className="rounded-3 object-fit-cover w-100"
                  style={{ height: '140px' }}
                />
              </div>

              <div className="col-md-6">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="badge bg-success">Next Upcoming Stay</span>
                  <span className="font-monospace small text-muted">Ref: {nextTrip.bookingId}</span>
                </div>
                <h4 className="fw-bold hp-serif text-dark mb-1">
                  {nextTrip.room?.name || 'Luxury Suite'}
                </h4>
                <p className="text-muted small mb-2">
                  Check-in:{' '}
                  <strong>{new Date(nextTrip.checkIn).toLocaleDateString()}</strong> &bull;{' '}
                  Check-out:{' '}
                  <strong>{new Date(nextTrip.checkOut).toLocaleDateString()}</strong> (
                  {nextTrip.totalNights} Nights)
                </p>
                <div className="d-flex align-items-center gap-1 text-muted small">
                  <FaClock className="text-warning" />
                  <span>Check-in begins at 3:00 PM &bull; Digital key ready upon arrival</span>
                </div>
              </div>

              <div className="col-md-3 text-md-end">
                <Link to="/my-bookings" className="btn btn-hp-outline-gold btn-sm">
                  View Stay Details
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Suite Search Widget */}
        <div className="hp-glass-panel p-4 mb-5">
          <h4 className="fw-bold hp-serif text-dark mb-2">Plan Your Next Escape</h4>
          <p className="text-muted small mb-4">
            Check real-time availability and reserve directly with our concierge.
          </p>

          <form onSubmit={handleQuickSearch}>
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                  Check-In Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  min={today}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                  Check-Out Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                  Guests
                </label>
                <select
                  className="form-select"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>

              <div className="col-md-2">
                <button type="submit" className="btn btn-hp-gold w-100">
                  <FaSearch className="me-1" /> Search
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Available Suites Preview */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <span className="text-warning fw-bold text-uppercase tracking-wider small">
                CURATED FOR YOU
              </span>
              <h3 className="fw-bold hp-serif text-dark mb-0">Recommended Luxury Suites</h3>
            </div>
            <Link to="/rooms" className="text-decoration-none fw-semibold hover-gold small">
              View All Suites <FaArrowRight className="ms-1" />
            </Link>
          </div>

          <div className="row g-4">
            {availableRooms.map((room) => (
              <div key={room._id} className="col-lg-4 col-md-6">
                <RoomCard room={room} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
