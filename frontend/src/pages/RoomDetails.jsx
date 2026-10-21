import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import {
  FaUserFriends,
  FaCheckCircle,
  FaCalendarAlt,
  FaShieldAlt,
  FaStar,
  FaArrowLeft,
  FaClock,
  FaConciergeBell,
  FaCreditCard
} from 'react-icons/fa';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  // Booking calculator state
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState('1');
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState(null);

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80';
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    return `${backendBase}${imagePath}`;
  };

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${id}`);
        if (res.data?.success) {
          setRoom(res.data.room);
          if (res.data.room.images && res.data.room.images.length > 0) {
            setSelectedImage(getImageUrl(res.data.room.images[0]));
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load suite details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  // Compute nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();
  const subtotal = room ? nights * room.pricePerNight : 0;
  const taxes = Math.round(subtotal * 0.12);
  const totalCost = subtotal + taxes;

  const handleCheckAvailability = async () => {
    setAvailabilityChecking(true);
    setAvailabilityMessage(null);
    try {
      const res = await api.get('/rooms/availability', {
        params: { roomId: room._id, checkIn, checkOut }
      });
      if (res.data?.success) {
        setAvailabilityMessage({
          available: res.data.available,
          text: res.data.available
            ? '✓ Room is open & available for your selected dates!'
            : '✗ Room is already booked for these dates. Please choose alternative dates.'
        });
      }
    } catch (err) {
      setAvailabilityMessage({
        available: false,
        text: err.message || 'Error checking availability.'
      });
    } finally {
      setAvailabilityChecking(false);
    }
  };

  const handleProceedToBooking = () => {
    const query = new URLSearchParams({
      checkIn,
      checkOut,
      guests
    }).toString();
    navigate(`/booking/${room._id}?${query}`);
  };

  if (loading) {
    return <LoadingSpinner fullPage={true} message="Loading suite specifications..." />;
  }

  if (error || !room) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mb-4">{error || 'Suite not found.'}</div>
        <Link to="/rooms" className="btn btn-hp-navy">
          <FaArrowLeft className="me-2" /> Back to Suites
        </Link>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className="container">
        {/* Breadcrumb / Back button */}
        <div className="mb-4">
          <Link to="/rooms" className="text-decoration-none text-muted small fw-semibold hover-gold">
            <FaArrowLeft className="me-1" /> Back to All Suites
          </Link>
        </div>

        <div className="row g-5">
          {/* Left Column: Gallery & Details */}
          <div className="col-lg-8">
            {/* Main Hero Photo */}
            <div
              className="rounded-4 overflow-hidden shadow-md mb-3 position-relative"
              style={{ height: '480px' }}
            >
              <img
                src={selectedImage || getImageUrl(room.images?.[0])}
                alt={room.name}
                className="w-100 h-100 object-fit-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="room-type-badge fs-6">{room.type} Suite</div>
            </div>

            {/* Thumbnail Gallery */}
            {room.images && room.images.length > 1 && (
              <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
                {room.images.map((img, idx) => {
                  const url = getImageUrl(img);
                  const isSelected = selectedImage === url;
                  return (
                    <img
                      key={idx}
                      src={url}
                      alt={`Thumbnail ${idx + 1}`}
                      className={`rounded-3 cursor-pointer object-fit-cover border ${
                        isSelected ? 'border-warning border-3' : 'border-light-subtle opacity-75'
                      }`}
                      style={{ width: '90px', height: '65px', transition: 'all 0.2s' }}
                      onClick={() => setSelectedImage(url)}
                    />
                  );
                })}
              </div>
            )}

            {/* Title & Key Specs Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
              <div>
                <span className="badge bg-dark text-warning text-uppercase mb-2">
                  Room #{room.roomNumber}
                </span>
                <h1 className="fw-bold hp-serif text-dark mb-1">{room.name}</h1>
              </div>
              <div className="text-end">
                <span className="display-6 fw-bold text-warning">${room.pricePerNight}</span>
                <span className="text-muted small"> / night</span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-4 text-muted small pb-4 border-bottom border-light-subtle mb-4">
              <span className="d-flex align-items-center gap-2">
                <FaUserFriends className="text-warning fs-5" />
                <span>Up to {room.capacity} Guests</span>
              </span>
              <span className="d-flex align-items-center gap-2">
                <FaStar className="text-warning fs-5" />
                <span>5-Star Luxury Grade</span>
              </span>
              <span className="d-flex align-items-center gap-2">
                <FaShieldAlt className="text-warning fs-5" />
                <span>100% Sanitized & Pre-Inspected</span>
              </span>
            </div>

            {/* Description */}
            <h4 className="fw-bold hp-serif text-dark mb-3">Suite Overview</h4>
            <p className="text-secondary lead fs-6 mb-5" style={{ lineHeight: '1.8' }}>
              {room.description}
            </p>

            {/* Amenities Grid */}
            <h4 className="fw-bold hp-serif text-dark mb-3">Included Amenities</h4>
            <div className="row g-3 mb-5">
              {room.amenities &&
                room.amenities.map((item, idx) => (
                  <div key={idx} className="col-md-6">
                    <div className="d-flex align-items-center gap-2 p-3 bg-white rounded-3 border border-light-subtle shadow-xs">
                      <FaCheckCircle className="text-warning flex-shrink-0" />
                      <span className="fw-semibold text-dark small">{item}</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Policies */}
            <div className="p-4 bg-light rounded-4 border border-light-subtle">
              <h5 className="fw-bold hp-serif text-dark mb-3">Stay Policies & Highlights</h5>
              <div className="row g-3 text-muted small">
                <div className="col-sm-6 d-flex align-items-start gap-2">
                  <FaClock className="text-warning mt-1" />
                  <div>
                    <strong>Check-In:</strong> From 3:00 PM<br />
                    <strong>Check-Out:</strong> Until 11:00 AM
                  </div>
                </div>
                <div className="col-sm-6 d-flex align-items-start gap-2">
                  <FaConciergeBell className="text-warning mt-1" />
                  <div>
                    <strong>Complimentary Butler Service:</strong> Available on demand via suite iPad.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Booking Widget */}
          <div className="col-lg-4">
            <div className="hp-glass-panel p-4 sticky-top" style={{ top: '100px' }}>
              <div className="d-flex justify-content-between align-items-baseline mb-3">
                <h4 className="fw-bold hp-serif text-dark mb-0">Reserve Suite</h4>
                <div>
                  <span className="fs-4 fw-bold text-warning">${room.pricePerNight}</span>
                  <span className="text-muted small">/night</span>
                </div>
              </div>

              <hr className="my-3 opacity-25" />

              {/* Date Pickers */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                  <FaCalendarAlt className="text-warning me-1" /> Check-In Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  min={today}
                  value={checkIn}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    setAvailabilityMessage(null);
                  }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                  <FaCalendarAlt className="text-warning me-1" /> Check-Out Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => {
                    setCheckOut(e.target.value);
                    setAvailabilityMessage(null);
                  }}
                />
              </div>

              {/* Guest Count */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                  <FaUserFriends className="text-warning me-1" /> Total Guests
                </label>
                <select
                  className="form-select"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                >
                  {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} Guest{num > 1 ? 's' : ''} (Max {room.capacity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Check Availability Button */}
              <button
                type="button"
                onClick={handleCheckAvailability}
                disabled={availabilityChecking}
                className="btn btn-outline-secondary btn-sm w-100 mb-3"
              >
                {availabilityChecking ? 'Checking Availability...' : 'Verify Dates Availability'}
              </button>

              {availabilityMessage && (
                <div
                  className={`alert ${
                    availabilityMessage.available ? 'alert-success' : 'alert-danger'
                  } small p-2 mb-3`}
                >
                  {availabilityMessage.text}
                </div>
              )}

              {/* Cost Summary Breakdown */}
              <div className="bg-light p-3 rounded-3 mb-4">
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>${room.pricePerNight} &times; {nights} night{nights > 1 ? 's' : ''}</span>
                  <span>${subtotal}</span>
                </div>
                <div className="d-flex justify-content-between small text-muted mb-2">
                  <span>State & Hospitality Taxes (12%)</span>
                  <span>${taxes}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold text-dark pt-2 border-top border-light-subtle fs-6">
                  <span>Total Amount</span>
                  <span className="text-warning">${totalCost}</span>
                </div>
              </div>

              {/* Proceed to Booking Button */}
              <button
                type="button"
                onClick={handleProceedToBooking}
                className="btn btn-hp-gold btn-lg w-100 text-center justify-content-center"
              >
                <span>Proceed to Reservation</span>
              </button>

              <div className="text-center text-muted small mt-3 d-flex align-items-center justify-content-center gap-1">
                <FaCreditCard className="text-success" />
                <span>Zero reservation fee &bull; Instant Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
