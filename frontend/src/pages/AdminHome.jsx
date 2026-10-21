import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import {
  FaChartPie,
  FaCalendarCheck,
  FaBed,
  FaPlusCircle,
  FaUsers,
  FaDollarSign,
  FaSearch,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaCheckCircle,
  FaTimesCircle,
  FaUpload,
  FaInfoCircle
} from 'react-icons/fa';

const AdminHome = () => {
  // Navigation Active Tab: 'overview' | 'bookings' | 'rooms' | 'add-room' | 'users'
  const [activeTab, setActiveTab] = useState('overview');

  // Overview Stats
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [roomTypeStats, setRoomTypeStats] = useState([]);

  // All Bookings
  const [bookings, setBookings] = useState([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingPaymentFilter, setBookingPaymentFilter] = useState('all');

  // All Rooms
  const [rooms, setRooms] = useState([]);
  const [roomSearch, setRoomSearch] = useState('');

  // All Users
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  // Add Room Form State
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    name: '',
    description: '',
    type: 'Deluxe',
    pricePerNight: '',
    capacity: 2,
    amenities: 'High-Speed Wi-Fi, Smart 4K HDTV, Rainfall Shower, Nespresso Machine, Climate Control',
    imageUrl1: '',
    imageUrl2: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [addRoomSubmitting, setAddRoomSubmitting] = useState(false);
  const [addRoomSuccess, setAddRoomSuccess] = useState('');
  const [addRoomError, setAddRoomError] = useState('');

  // Edit Room Modal State
  const [editingRoom, setEditingRoom] = useState(null);
  const [editRoomSubmitting, setEditRoomSubmitting] = useState(false);

  // Status Update Booking Modal State
  const [editingBooking, setEditingBooking] = useState(null);
  const [newBookingStatus, setNewBookingStatus] = useState('confirmed');
  const [newBookingPaymentStatus, setNewBookingPaymentStatus] = useState('paid');
  const [updateBookingSubmitting, setUpdateBookingSubmitting] = useState(false);

  // General Loading & Notification States
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

  // Load Overview Data
  const loadOverview = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data?.success) {
        setStats(res.data.stats);
        setRecentBookings(res.data.recentBookings || []);
        setRoomTypeStats(res.data.roomTypeStats || []);
      }
    } catch (err) {
      console.error('Failed to load overview:', err);
    }
  };

  // Load Bookings
  const loadBookings = async () => {
    try {
      const params = {};
      if (bookingSearch) params.search = bookingSearch;
      if (bookingStatusFilter !== 'all') params.status = bookingStatusFilter;
      if (bookingPaymentFilter !== 'all') params.paymentStatus = bookingPaymentFilter;

      const res = await api.get('/admin/bookings', { params });
      if (res.data?.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load admin bookings:', err);
    }
  };

  // Load Rooms
  const loadRooms = async () => {
    try {
      const res = await api.get('/admin/rooms');
      if (res.data?.success) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      console.error('Failed to load admin rooms:', err);
    }
  };

  // Load Users
  const loadUsers = async () => {
    try {
      const params = {};
      if (userSearch) params.search = userSearch;
      const res = await api.get('/admin/users', { params });
      if (res.data?.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load admin users:', err);
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadOverview(), loadBookings(), loadRooms(), loadUsers()]);
      setLoading(false);
    };
    init();
  }, []);

  // Handle Tab Switch
  useEffect(() => {
    if (activeTab === 'overview') loadOverview();
    if (activeTab === 'bookings') loadBookings();
    if (activeTab === 'rooms') loadRooms();
    if (activeTab === 'users') loadUsers();
  }, [activeTab]);

  // Toggle Room Active Status
  const handleToggleRoomStatus = async (room) => {
    try {
      const res = await api.patch(`/rooms/${room._id}/status`, {
        isActive: !room.isActive
      });
      if (res.data?.success) {
        setActionMessage({
          success: true,
          text: `Room #${room.roomNumber} is now ${res.data.room.isActive ? 'Active' : 'Inactive'}.`
        });
        await loadRooms();
        await loadOverview();
      }
    } catch (err) {
      setActionMessage({
        success: false,
        text: err.message || 'Failed to toggle room status.'
      });
    }
  };

  // Delete Room with Safeguard Check
  const handleDeleteRoom = async (room) => {
    if (
      !window.confirm(
        `Are you sure you want to delete Room #${room.roomNumber}? If this room has historical reservations, deletion will be rejected to protect audit integrity.`
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(`/rooms/${room._id}`);
      if (res.data?.success) {
        setActionMessage({ success: true, text: res.data.message });
        await loadRooms();
        await loadOverview();
      }
    } catch (err) {
      setActionMessage({
        success: false,
        text: err.message || 'Cannot delete room with existing booking history.'
      });
    }
  };

  // Submit Add Room (Supports both Multer image upload & external image URLs)
  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    setAddRoomSubmitting(true);
    setAddRoomSuccess('');
    setAddRoomError('');

    try {
      const formData = new FormData();
      formData.append('roomNumber', newRoom.roomNumber);
      formData.append('name', newRoom.name);
      formData.append('description', newRoom.description);
      formData.append('type', newRoom.type);
      formData.append('pricePerNight', newRoom.pricePerNight);
      formData.append('capacity', newRoom.capacity);
      formData.append('amenities', newRoom.amenities);

      // Append files for Multer
      if (imageFiles.length > 0) {
        Array.from(imageFiles).forEach((file) => {
          formData.append('images', file);
        });
      }

      // Collect external image URLs if provided
      const externalImages = [];
      if (newRoom.imageUrl1) externalImages.push(newRoom.imageUrl1);
      if (newRoom.imageUrl2) externalImages.push(newRoom.imageUrl2);
      if (externalImages.length > 0 && imageFiles.length === 0) {
        formData.append('images', JSON.stringify(externalImages));
      }

      const res = await api.post('/rooms', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.success) {
        setAddRoomSuccess(`Room #${newRoom.roomNumber} created successfully!`);
        setNewRoom({
          roomNumber: '',
          name: '',
          description: '',
          type: 'Deluxe',
          pricePerNight: '',
          capacity: 2,
          amenities: 'High-Speed Wi-Fi, Smart 4K HDTV, Rainfall Shower, Nespresso Machine, Climate Control',
          imageUrl1: '',
          imageUrl2: ''
        });
        setImageFiles([]);
        await loadRooms();
        await loadOverview();
      }
    } catch (err) {
      setAddRoomError(err.message || 'Failed to create room.');
    } finally {
      setAddRoomSubmitting(false);
    }
  };

  // Submit Edit Room
  const handleEditRoomSubmit = async (e) => {
    e.preventDefault();
    if (!editingRoom) return;
    setEditRoomSubmitting(true);

    try {
      const payload = {
        name: editingRoom.name,
        roomNumber: editingRoom.roomNumber,
        type: editingRoom.type,
        pricePerNight: editingRoom.pricePerNight,
        capacity: editingRoom.capacity,
        description: editingRoom.description,
        amenities: editingRoom.amenities
      };

      const res = await api.put(`/rooms/${editingRoom._id}`, payload);
      if (res.data?.success) {
        setActionMessage({ success: true, text: 'Room updated successfully.' });
        setEditingRoom(null);
        await loadRooms();
      }
    } catch (err) {
      setActionMessage({ success: false, text: err.message || 'Failed to update room.' });
    } finally {
      setEditRoomSubmitting(false);
    }
  };

  // Submit Update Booking Status
  const handleUpdateBookingStatusSubmit = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;
    setUpdateBookingSubmitting(true);

    try {
      const res = await api.patch(`/admin/bookings/${editingBooking._id}/status`, {
        status: newBookingStatus,
        paymentStatus: newBookingPaymentStatus
      });

      if (res.data?.success) {
        setActionMessage({
          success: true,
          text: `Booking ${editingBooking.bookingId} updated to ${newBookingStatus}.`
        });
        setEditingBooking(null);
        await loadBookings();
        await loadOverview();
      }
    } catch (err) {
      setActionMessage({ success: false, text: err.message || 'Failed to update booking status.' });
    } finally {
      setUpdateBookingSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage={true} message="Loading administrative portal..." />;
  }

  return (
    <div className="py-4">
      <div className="container-fluid px-lg-5">
        {/* Top Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom border-light-subtle">
          <div>
            <span className="badge bg-warning text-dark text-uppercase fw-bold mb-1">
              General Manager Administration
            </span>
            <h1 className="display-6 fw-bold hp-serif text-dark mb-0">
              HotelPro Management Dashboard
            </h1>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button
              onClick={() => setActiveTab('add-room')}
              className="btn btn-hp-gold btn-sm d-flex align-items-center gap-1"
            >
              <FaPlusCircle />
              <span>Add New Room</span>
            </button>
          </div>
        </div>

        {/* Global Action Message Banner */}
        {actionMessage && (
          <div
            className={`alert ${
              actionMessage.success ? 'alert-success' : 'alert-danger'
            } alert-dismissible fade show`}
            role="alert"
          >
            {actionMessage.text}
            <button
              type="button"
              className="btn-close"
              onClick={() => setActionMessage(null)}
            />
          </div>
        )}

        <div className="row g-4">
          {/* Left Sidebar Navigation */}
          <div className="col-lg-3 col-xl-2">
            <div className="hp-card p-3 sticky-top" style={{ top: '90px' }}>
              <div className="text-muted small text-uppercase fw-bold px-3 mb-2">Navigation</div>

              <div
                className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <FaChartPie />
                <span>Overview</span>
              </div>

              <div
                className={`admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                <FaCalendarCheck />
                <span>All Bookings ({bookings.length})</span>
              </div>

              <div
                className={`admin-nav-item ${activeTab === 'rooms' ? 'active' : ''}`}
                onClick={() => setActiveTab('rooms')}
              >
                <FaBed />
                <span>All Rooms ({rooms.length})</span>
              </div>

              <div
                className={`admin-nav-item ${activeTab === 'add-room' ? 'active' : ''}`}
                onClick={() => setActiveTab('add-room')}
              >
                <FaPlusCircle />
                <span>Add Room</span>
              </div>

              <div
                className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <FaUsers />
                <span>Customers ({users.length})</span>
              </div>
            </div>
          </div>

          {/* Right Main Content Panel */}
          <div className="col-lg-9 col-xl-10">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                {/* 6 Summary KPI Cards */}
                <div className="row g-3 mb-4">
                  <div className="col-sm-6 col-xl-4">
                    <div className="kpi-stat-card">
                      <div>
                        <small className="text-muted text-uppercase fw-bold">Total Rooms</small>
                        <h2 className="fw-bold text-dark mt-1 mb-0">
                          {stats?.totalRooms || 0}{' '}
                          <small className="fs-6 text-muted">({stats?.activeRooms || 0} active)</small>
                        </h2>
                      </div>
                      <div className="kpi-icon-box bg-primary bg-opacity-10 text-primary">
                        <FaBed />
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 col-xl-4">
                    <div className="kpi-stat-card">
                      <div>
                        <small className="text-muted text-uppercase fw-bold">Registered Guests</small>
                        <h2 className="fw-bold text-dark mt-1 mb-0">{stats?.totalCustomers || 0}</h2>
                      </div>
                      <div className="kpi-icon-box bg-info bg-opacity-10 text-info">
                        <FaUsers />
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 col-xl-4">
                    <div className="kpi-stat-card">
                      <div>
                        <small className="text-muted text-uppercase fw-bold">Total Reservations</small>
                        <h2 className="fw-bold text-dark mt-1 mb-0">{stats?.totalBookings || 0}</h2>
                      </div>
                      <div className="kpi-icon-box bg-secondary bg-opacity-10 text-secondary">
                        <FaCalendarCheck />
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 col-xl-4">
                    <div className="kpi-stat-card">
                      <div>
                        <small className="text-muted text-uppercase fw-bold">Confirmed Bookings</small>
                        <h2 className="fw-bold text-success mt-1 mb-0">{stats?.confirmedBookings || 0}</h2>
                      </div>
                      <div className="kpi-icon-box bg-success bg-opacity-10 text-success">
                        <FaCheckCircle />
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 col-xl-4">
                    <div className="kpi-stat-card">
                      <div>
                        <small className="text-muted text-uppercase fw-bold">Cancelled Bookings</small>
                        <h2 className="fw-bold text-danger mt-1 mb-0">{stats?.cancelledBookings || 0}</h2>
                      </div>
                      <div className="kpi-icon-box bg-danger bg-opacity-10 text-danger">
                        <FaTimesCircle />
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 col-xl-4">
                    <div className="kpi-stat-card">
                      <div>
                        <small className="text-muted text-uppercase fw-bold">Verified Revenue</small>
                        <h2 className="fw-bold text-warning mt-1 mb-0">${stats?.totalRevenue || 0}</h2>
                      </div>
                      <div className="kpi-icon-box bg-warning bg-opacity-10 text-warning">
                        <FaDollarSign />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings Table */}
                <div className="hp-card p-4 mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold hp-serif text-dark mb-0">Recent Reservations</h5>
                    <button onClick={() => setActiveTab('bookings')} className="btn btn-sm btn-outline-secondary">
                      View All
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light small text-uppercase">
                        <tr>
                          <th>Ref ID</th>
                          <th>Guest</th>
                          <th>Suite</th>
                          <th>Dates</th>
                          <th>Total</th>
                          <th>Booking Status</th>
                          <th>Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((b) => (
                          <tr key={b._id}>
                            <td className="font-monospace fw-bold text-primary small">{b.bookingId}</td>
                            <td>
                              <div className="fw-semibold">{b.guestName}</div>
                              <small className="text-muted">{b.guestPhone}</small>
                            </td>
                            <td>
                              <div>{b.room?.name || 'Deluxe Room'}</div>
                              <small className="text-muted">#{b.room?.roomNumber}</small>
                            </td>
                            <td className="small">
                              {new Date(b.checkIn).toLocaleDateString()} &rarr;{' '}
                              {new Date(b.checkOut).toLocaleDateString()}
                            </td>
                            <td className="fw-bold">${b.totalAmount}</td>
                            <td>
                              <span className={`hp-badge hp-badge-${b.status}`}>{b.status}</span>
                            </td>
                            <td>
                              <span className={`hp-badge hp-badge-${b.paymentStatus}`}>
                                {b.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ALL BOOKINGS */}
            {activeTab === 'bookings' && (
              <div className="hp-card p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                  <h4 className="fw-bold hp-serif text-dark mb-0">All Reservations</h4>

                  {/* Search and Filters */}
                  <div className="d-flex flex-wrap gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search ID or Guest Name..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadBookings()}
                      style={{ width: '220px' }}
                    />
                    <select
                      className="form-select form-select-sm"
                      value={bookingStatusFilter}
                      onChange={(e) => setBookingStatusFilter(e.target.value)}
                      style={{ width: '150px' }}
                    >
                      <option value="all">Status: All</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                      className="form-select form-select-sm"
                      value={bookingPaymentFilter}
                      onChange={(e) => setBookingPaymentFilter(e.target.value)}
                      style={{ width: '150px' }}
                    >
                      <option value="all">Payment: All</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="refunded">Refunded</option>
                      <option value="failed">Failed</option>
                    </select>
                    <button onClick={loadBookings} className="btn btn-sm btn-hp-gold">
                      Filter
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small text-uppercase">
                      <tr>
                        <th>Booking ID</th>
                        <th>Guest Details</th>
                        <th>Reserved Suite</th>
                        <th>Stay Dates</th>
                        <th>Total</th>
                        <th>Booking Status</th>
                        <th>Payment Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b._id}>
                          <td className="font-monospace fw-bold small text-primary">{b.bookingId}</td>
                          <td>
                            <div className="fw-bold">{b.guestName}</div>
                            <small className="text-muted d-block">{b.guestPhone}</small>
                            <small className="text-muted">{b.user?.email}</small>
                          </td>
                          <td>
                            <div className="fw-semibold">{b.room?.name || 'Suite'}</div>
                            <small className="text-muted">
                              #{b.room?.roomNumber} &bull; {b.room?.type}
                            </small>
                          </td>
                          <td className="small">
                            <div>{new Date(b.checkIn).toLocaleDateString()}</div>
                            <div className="text-muted">
                              to {new Date(b.checkOut).toLocaleDateString()} ({b.totalNights} nights)
                            </div>
                          </td>
                          <td className="fw-bold fs-6">${b.totalAmount}</td>
                          <td>
                            <span className={`hp-badge hp-badge-${b.status}`}>{b.status}</span>
                          </td>
                          <td>
                            <span className={`hp-badge hp-badge-${b.paymentStatus}`}>
                              {b.paymentStatus}
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              onClick={() => {
                                setEditingBooking(b);
                                setNewBookingStatus(b.status);
                                setNewBookingPaymentStatus(b.paymentStatus);
                              }}
                              className="btn btn-outline-primary btn-sm"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: ALL ROOMS */}
            {activeTab === 'rooms' && (
              <div className="hp-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold hp-serif text-dark mb-0">Inventory & Room Catalog</h4>
                  <button onClick={() => setActiveTab('add-room')} className="btn btn-hp-gold btn-sm">
                    <FaPlusCircle className="me-1" /> Add New Suite
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small text-uppercase">
                      <tr>
                        <th>Room</th>
                        <th>Name & Details</th>
                        <th>Type</th>
                        <th>Capacity</th>
                        <th>Rate / Night</th>
                        <th>Bookings Count</th>
                        <th>Catalog Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((r) => (
                        <tr key={r._id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={
                                  r.images?.[0] ||
                                  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=200&q=80'
                                }
                                alt={r.name}
                                className="rounded-2 object-fit-cover"
                                style={{ width: '48px', height: '48px' }}
                              />
                              <span className="badge bg-dark">#{r.roomNumber}</span>
                            </div>
                          </td>
                          <td>
                            <div className="fw-bold">{r.name}</div>
                            <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '280px' }}>
                              {r.description}
                            </small>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">{r.type}</span>
                          </td>
                          <td>{r.capacity} Guests</td>
                          <td className="fw-bold text-warning">${r.pricePerNight}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {r.totalBookingsCount || 0} total
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggleRoomStatus(r)}
                              className={`btn btn-sm ${
                                r.isActive ? 'btn-success' : 'btn-outline-secondary'
                              } d-flex align-items-center gap-1`}
                              title="Click to toggle status"
                            >
                              {r.isActive ? <FaToggleOn /> : <FaToggleOff />}
                              <span>{r.isActive ? 'Active' : 'Inactive'}</span>
                            </button>
                          </td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-1">
                              <button
                                onClick={() => setEditingRoom(r)}
                                className="btn btn-outline-primary btn-sm"
                                title="Edit Suite"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(r)}
                                className="btn btn-outline-danger btn-sm"
                                title="Delete Suite (with safeguard)"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: ADD ROOM */}
            {activeTab === 'add-room' && (
              <div className="hp-card p-4">
                <h4 className="fw-bold hp-serif text-dark mb-2">Create New Luxury Suite</h4>
                <p className="text-muted small mb-4">
                  Add rooms to the reservation catalog. Multer will process uploaded image files.
                </p>

                {addRoomSuccess && <div className="alert alert-success">{addRoomSuccess}</div>}
                {addRoomError && <div className="alert alert-danger">{addRoomError}</div>}

                <form onSubmit={handleAddRoomSubmit}>
                  <div className="row g-3 mb-4">
                    <div className="col-md-3">
                      <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                        Room Number *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. 601"
                        value={newRoom.roomNumber}
                        onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                        Suite Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Presidential Palm Penthouse"
                        value={newRoom.name}
                        onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                        Suite Type *
                      </label>
                      <select
                        className="form-select"
                        value={newRoom.type}
                        onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                      >
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Suite">Suite</option>
                        <option value="Family">Family</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                        Nightly Price (USD) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        required
                        placeholder="e.g. 295"
                        value={newRoom.pricePerNight}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, pricePerNight: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                        Max Capacity (Guests) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        className="form-control"
                        required
                        value={newRoom.capacity}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, capacity: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                        Description *
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        required
                        placeholder="Detailed room features, architectural views, bed configuration..."
                        value={newRoom.description}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, description: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                        Amenities (Comma separated)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={newRoom.amenities}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, amenities: e.target.value })
                        }
                      />
                    </div>

                    {/* Multer Image Upload */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                        <FaUpload className="text-warning me-1" /> Upload Room Images (Multer)
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => setImageFiles(e.target.files)}
                      />
                      <small className="text-muted">
                        Max 5MB each. Allowed: JPEG, PNG, WebP.
                      </small>
                    </div>

                    {/* Fallback Image URL */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                        Or External Image URL (e.g. Unsplash)
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://images.unsplash.com/..."
                        value={newRoom.imageUrl1}
                        onChange={(e) => setNewRoom({ ...newRoom, imageUrl1: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={addRoomSubmitting}
                    className="btn btn-hp-gold btn-lg px-4"
                  >
                    {addRoomSubmitting ? 'Creating Room...' : 'Publish Room to Inventory'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 5: ALL USERS */}
            {activeTab === 'users' && (
              <div className="hp-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold hp-serif text-dark mb-0">Registered Customers & Staff</h4>

                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                    style={{ width: '250px' }}
                  />
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small text-uppercase">
                      <tr>
                        <th>Customer Name</th>
                        <th>Email Address</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Total Bookings</th>
                        <th>Total Revenue</th>
                        <th>Member Since</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td className="fw-bold text-dark">{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.phone}</td>
                          <td>
                            <span
                              className={`badge ${
                                u.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {u.totalBookings || 0} stays
                            </span>
                          </td>
                          <td className="fw-bold text-success">${u.totalSpent || 0}</td>
                          <td className="small text-muted">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Room Modal */}
        {editingRoom && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold hp-serif text-dark">
                    Edit Suite #{editingRoom.roomNumber}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditingRoom(null)}
                  />
                </div>
                <form onSubmit={handleEditRoomSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Room Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editingRoom.name}
                          onChange={(e) =>
                            setEditingRoom({ ...editingRoom, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Room Number</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editingRoom.roomNumber}
                          onChange={(e) =>
                            setEditingRoom({ ...editingRoom, roomNumber: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Price Per Night ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editingRoom.pricePerNight}
                          onChange={(e) =>
                            setEditingRoom({
                              ...editingRoom,
                              pricePerNight: Number(e.target.value)
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Capacity (Guests)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editingRoom.capacity}
                          onChange={(e) =>
                            setEditingRoom({ ...editingRoom, capacity: Number(e.target.value) })
                          }
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-bold">Description</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={editingRoom.description}
                          onChange={(e) =>
                            setEditingRoom({ ...editingRoom, description: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setEditingRoom(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editRoomSubmitting}
                      className="btn btn-hp-gold"
                    >
                      {editRoomSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Update Booking Status Modal */}
        {editingBooking && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold hp-serif text-dark">
                    Manage Booking {editingBooking.bookingId}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditingBooking(null)}
                  />
                </div>
                <form onSubmit={handleUpdateBookingStatusSubmit}>
                  <div className="modal-body">
                    <div className="p-3 bg-light rounded-3 mb-3 small">
                      <div>
                        <strong>Guest:</strong> {editingBooking.guestName} ({editingBooking.guestPhone})
                      </div>
                      <div>
                        <strong>Suite:</strong> {editingBooking.room?.name} (#{editingBooking.room?.roomNumber})
                      </div>
                      <div>
                        <strong>Total:</strong> ${editingBooking.totalAmount} USD
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Booking Status</label>
                      <select
                        className="form-select"
                        value={newBookingStatus}
                        onChange={(e) => setNewBookingStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled (Triggers Refund if Paid)</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Payment Status</label>
                      <select
                        className="form-select"
                        value={newBookingPaymentStatus}
                        onChange={(e) => setNewBookingPaymentStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setEditingBooking(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateBookingSubmitting}
                      className="btn btn-hp-gold"
                    >
                      {updateBookingSubmitting ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
