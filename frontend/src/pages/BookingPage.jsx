import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import {
  FaLock,
  FaShieldAlt,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaBed,
  FaInfoCircle,
  FaReceipt,
  FaArrowLeft
} from 'react-icons/fa';

const BookingPage = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const initialCheckIn = searchParams.get('checkIn') || today;
  const initialCheckOut = searchParams.get('checkOut') || tomorrow;
  const initialGuests = searchParams.get('guests') || '1';

  // State
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guestCount, setGuestCount] = useState(initialGuests);
  const [specialRequests, setSpecialRequests] = useState('');

  // Booking Flow Steps: 1 = Review & Initiate, 2 = Payment Sandbox Checkout, 3 = Confirmed
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState(null);
  const [initiatingBooking, setInitiatingBooking] = useState(false);

  // Payment Sandbox State
  const [cardBrand, setCardBrand] = useState('Visa');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Alexander Sterling');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('•••');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [confirmedPayment, setConfirmedPayment] = useState(null);

  // Hydrate user info if context loads
  useEffect(() => {
    if (user) {
      if (!guestName) setGuestName(user.name);
      if (!guestPhone) setGuestPhone(user.phone);
      if (!cardHolder) setCardHolder(user.name);
    }
  }, [user]);

  // Fetch Room
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}`);
        if (res.data?.success) {
          setRoom(res.data.room);
        }
      } catch (err) {
        setError(err.message || 'Unable to retrieve suite specifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  // Calculate nights & estimated totals
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();
  const estimatedSubtotal = room ? nights * room.pricePerNight : 0;

  // Step 1: Initiate Booking on Server (Strict Server Calculations & Overlap Checks)
  const handleInitiateBooking = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/booking/${roomId}` } });
      return;
    }

    if (!guestName || !guestPhone) {
      setError('Please provide primary guest name and contact telephone.');
      return;
    }

    setInitiatingBooking(true);

    try {
      const payload = {
        roomId: room._id,
        checkIn,
        checkOut,
        guestName,
        guestPhone,
        guestCount: Number(guestCount),
        specialRequests
      };

      const res = await api.post('/bookings', payload);
      if (res.data?.success && res.data.booking) {
        setBookingData(res.data.booking);
        setStep(2); // Move to Payment Sandbox
      }
    } catch (err) {
      setError(err.message || 'Reservation failed. Room may be unavailable for these dates.');
    } finally {
      setInitiatingBooking(false);
    }
  };

  // Step 2: Payment Sandbox Execution
  const handleProcessPayment = async (simulateOutcome = 'success') => {
    setProcessingPayment(true);
    setPaymentError('');

    try {
      const payload = {
        bookingId: bookingData._id,
        cardBrand,
        cardLast4: '4242',
        simulateOutcome
      };

      const res = await api.post('/payments/checkout', payload);
      if (res.data?.success) {
        setConfirmedPayment(res.data.payment);
        setBookingData(res.data.booking);
        setStep(3); // Confirmed!
      }
    } catch (err) {
      setPaymentError(
        err.message || 'Payment simulation failed. Card was declined by sandbox issuer.'
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage={true} message="Preparing reservation summary..." />;
  }

  if (error && !room) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mb-4">{error}</div>
        <Link to="/rooms" className="btn btn-hp-navy">
          <FaArrowLeft className="me-2" /> Back to Suites
        </Link>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className="container">
        {/* Step Progress Bar */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8 text-center">
            <span className="text-warning fw-bold text-uppercase tracking-wider small">
              SECURE RESERVATION WORKFLOW
            </span>
            <h1 className="display-6 fw-bold hp-serif text-dark mt-1 mb-4">
              {step === 1 && 'Confirm Stay & Guest Details'}
              {step === 2 && 'HotelPro Payment Sandbox'}
              {step === 3 && 'Reservation Confirmed & Paid'}
            </h1>

            <div className="d-flex justify-content-center align-items-center gap-3">
              <span
                className={`badge rounded-pill px-3 py-2 ${
                  step >= 1 ? 'bg-warning text-dark fw-bold' : 'bg-light text-muted'
                }`}
              >
                1. Guest Info & Dates
              </span>
              <span className="text-muted">&rarr;</span>
              <span
                className={`badge rounded-pill px-3 py-2 ${
                  step >= 2 ? 'bg-warning text-dark fw-bold' : 'bg-light text-muted'
                }`}
              >
                2. Sandbox Checkout
              </span>
              <span className="text-muted">&rarr;</span>
              <span
                className={`badge rounded-pill px-3 py-2 ${
                  step === 3 ? 'bg-success text-white fw-bold' : 'bg-light text-muted'
                }`}
              >
                3. Confirmation
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="row justify-content-center mb-4">
            <div className="col-lg-10">
              <div className="alert alert-danger shadow-sm">{error}</div>
            </div>
          </div>
        )}

        {/* STEP 1: REVIEW & INITIATE */}
        {step === 1 && (
          <div className="row g-5 justify-content-center">
            {/* Left: Guest Details Form */}
            <div className="col-lg-7">
              <div className="hp-glass-panel p-4 mb-4">
                <h4 className="fw-bold hp-serif text-dark mb-3">Primary Guest Information</h4>
                <p className="text-muted small mb-4">
                  Please provide your contact credentials for check-in registration and confirmation vouchers.
                </p>

                <form onSubmit={handleInitiateBooking}>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                        <FaUser className="text-warning me-1" /> Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Lord Alexander Sterling"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                        <FaPhone className="text-warning me-1" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+1 (800) 555-0199"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                        <FaCalendarAlt className="text-warning me-1" /> Check-In Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        min={today}
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                        <FaCalendarAlt className="text-warning me-1" /> Check-Out Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        min={checkIn || today}
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                        Total Guests In Suite
                      </label>
                      <select
                        className="form-select"
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                      >
                        {Array.from({ length: room?.capacity || 2 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n} Guest{n > 1 ? 's' : ''} (Room Capacity: {room?.capacity})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="e.g. High floor preference, airport pickup arrival time, dietary requests..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={initiatingBooking}
                    className="btn btn-hp-gold btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                  >
                    <FaLock />
                    <span>
                      {initiatingBooking ? 'Securing Dates...' : 'Continue to Payment Sandbox'}
                    </span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Suite Summary & Pricing Card */}
            <div className="col-lg-5">
              <div className="hp-card p-4">
                <h5 className="fw-bold hp-serif text-dark mb-3">Reservation Summary</h5>

                <div className="d-flex gap-3 mb-3 pb-3 border-bottom border-light-subtle">
                  <img
                    src={room?.images?.[0] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=400&q=80'}
                    alt={room?.name}
                    className="rounded-3 object-fit-cover"
                    style={{ width: '80px', height: '80px' }}
                  />
                  <div>
                    <span className="badge bg-dark text-warning small">{room?.type} Suite</span>
                    <h6 className="fw-bold text-dark mt-1 mb-0">{room?.name}</h6>
                    <small className="text-muted">Room #{room?.roomNumber}</small>
                  </div>
                </div>

                <div className="small text-muted mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Check-In:</span>
                    <strong className="text-dark">{checkIn} (from 3:00 PM)</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Check-Out:</span>
                    <strong className="text-dark">{checkOut} (until 11:00 AM)</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Total Duration:</span>
                    <strong className="text-dark">{nights} Night{nights > 1 ? 's' : ''}</strong>
                  </div>
                </div>

                {/* Pricing Table */}
                <div className="bg-light p-3 rounded-3 mb-3">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Rate / Night</span>
                    <span>${room?.pricePerNight}</span>
                  </div>
                  <div className="d-flex justify-content-between small text-muted mb-2">
                    <span>Nights Total</span>
                    <span>&times; {nights}</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold text-dark pt-2 border-top border-light-subtle fs-5">
                    <span>Total Payable</span>
                    <span className="text-warning">${estimatedSubtotal}</span>
                  </div>
                  <small className="text-muted d-block mt-1">
                    * Server calculates final nightly rates and guarantees price integrity.
                  </small>
                </div>

                <div className="d-flex align-items-center gap-2 text-muted small">
                  <FaShieldAlt className="text-success fs-5 flex-shrink-0" />
                  <span>Free cancellation up until 24 hours prior to check-in date.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT SANDBOX CHECKOUT */}
        {step === 2 && bookingData && (
          <div className="row g-5 justify-content-center">
            <div className="col-lg-7">
              {/* Payment Sandbox Alert Box */}
              <div className="sandbox-banner mb-4">
                <div className="d-flex align-items-start gap-2">
                  <FaInfoCircle className="text-warning fs-5 mt-1 flex-shrink-0" />
                  <div>
                    <h6 className="fw-bold text-dark mb-1">
                      HotelPro Payment Sandbox (Development Mode)
                    </h6>
                    <p className="small text-secondary mb-0">
                      This environment operates in a secure sandbox simulation. No actual credit card
                      is charged. Card numbers are never stored in plain text. You can test both
                      successful authorization and declined scenarios.
                    </p>
                  </div>
                </div>
              </div>

              {paymentError && (
                <div className="alert alert-danger shadow-sm mb-4 d-flex align-items-center gap-2">
                  <FaTimesCircle className="fs-5" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Simulated Card Preview Box */}
              <div className="simulated-card-box mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex align-items-center gap-2">
                    <FaCreditCard className="text-warning fs-4" />
                    <span className="fw-bold tracking-wider small">HOTELPRO SANDBOX CARD</span>
                  </div>
                  <span className="badge bg-warning text-dark fw-bold">{cardBrand}</span>
                </div>

                <div className="fs-4 font-monospace letter-spacing-2 mb-4">
                  {cardNumber}
                </div>

                <div className="d-flex justify-content-between align-items-end">
                  <div>
                    <small className="text-white-50 text-uppercase d-block fs-xs">Cardholder Name</small>
                    <span className="fw-bold">{cardHolder}</span>
                  </div>
                  <div>
                    <small className="text-white-50 text-uppercase d-block fs-xs">Expires</small>
                    <span className="fw-bold">{cardExpiry}</span>
                  </div>
                </div>
              </div>

              {/* Sandbox Card Inputs */}
              <div className="hp-glass-panel p-4 mb-4">
                <h5 className="fw-bold hp-serif text-dark mb-3">Card Payment Information</h5>

                <div className="row g-3 mb-4">
                  <div className="col-12">
                    <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                      Cardholder Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                    />
                  </div>

                  <div className="col-md-8">
                    <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                      Simulated Card Number
                    </label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      value={cardNumber}
                      disabled
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-secondary text-uppercase mb-1">
                      Card Network
                    </label>
                    <select
                      className="form-select"
                      value={cardBrand}
                      onChange={(e) => setCardBrand(e.target.value)}
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="American Express">American Express</option>
                    </select>
                  </div>
                </div>

                {/* Sandbox Action Trigger Buttons */}
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <button
                    type="button"
                    disabled={processingPayment}
                    onClick={() => handleProcessPayment('success')}
                    className="btn btn-hp-gold btn-lg flex-fill d-flex align-items-center justify-content-center gap-2"
                  >
                    <FaLock />
                    <span>
                      {processingPayment ? 'Authorizing Sandbox...' : `Pay $${bookingData.totalAmount} (Simulate Success)`}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={processingPayment}
                    onClick={() => handleProcessPayment('decline')}
                    className="btn btn-outline-danger btn-lg flex-fill d-flex align-items-center justify-content-center gap-2"
                  >
                    <FaTimesCircle />
                    <span>Test Card Decline</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Booking Order Summary */}
            <div className="col-lg-5">
              <div className="hp-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold hp-serif text-dark mb-0">Booking Ref</h5>
                  <span className="badge bg-warning text-dark font-monospace">
                    {bookingData.bookingId}
                  </span>
                </div>

                <div className="bg-light p-3 rounded-3 mb-3 small">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Suite:</span>
                    <strong className="text-dark">{room?.name}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Guest:</span>
                    <strong className="text-dark">{bookingData.guestName}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Check-In:</span>
                    <strong className="text-dark">
                      {new Date(bookingData.checkIn).toLocaleDateString()}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Check-Out:</span>
                    <strong className="text-dark">
                      {new Date(bookingData.checkOut).toLocaleDateString()}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Nights:</span>
                    <strong className="text-dark">{bookingData.totalNights} Nights</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Rate / Night:</span>
                    <strong className="text-dark">${bookingData.pricePerNight}</strong>
                  </div>
                  <div className="d-flex justify-content-between pt-2 border-top border-light-subtle fs-6 fw-bold">
                    <span>Total Server Amount:</span>
                    <span className="text-warning">${bookingData.totalAmount}</span>
                  </div>
                </div>

                <div className="text-center text-muted small">
                  <FaShieldAlt className="text-success me-1" />
                  <span>256-Bit SSL Encrypted Sandbox Session</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BOOKING CONFIRMED & RECEIPT */}
        {step === 3 && bookingData && (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="hp-glass-panel p-5 text-center shadow-lg">
                <div
                  className="rounded-circle bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '80px', height: '80px' }}
                >
                  <FaCheckCircle className="fs-1" />
                </div>

                <span className="badge bg-success px-3 py-2 text-uppercase mb-2">
                  Payment Verified & Confirmed
                </span>

                <h2 className="display-6 fw-bold hp-serif text-dark mb-2">
                  Thank You for Reserving With HotelPro!
                </h2>
                <p className="text-muted mb-4">
                  A confirmation voucher has been generated for your upcoming stay.
                </p>

                {/* Receipt Box */}
                <div className="bg-light p-4 rounded-4 text-start mb-4 border border-light-subtle">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                    <div>
                      <small className="text-muted text-uppercase d-block">Booking Identifier</small>
                      <h5 className="fw-bold text-dark font-monospace mb-0">
                        {bookingData.bookingId}
                      </h5>
                    </div>
                    <div className="text-end">
                      <small className="text-muted text-uppercase d-block">Payment Ref</small>
                      <span className="font-monospace small fw-bold text-success">
                        {confirmedPayment?.transactionId || bookingData.paymentId}
                      </span>
                    </div>
                  </div>

                  <div className="row g-3 small">
                    <div className="col-sm-6">
                      <span className="text-muted d-block">Reserved Suite:</span>
                      <strong>{room?.name} (#{room?.roomNumber})</strong>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted d-block">Primary Guest:</span>
                      <strong>{bookingData.guestName} ({bookingData.guestPhone})</strong>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted d-block">Check-In Date:</span>
                      <strong>{new Date(bookingData.checkIn).toLocaleDateString()} (3:00 PM)</strong>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted d-block">Check-Out Date:</span>
                      <strong>{new Date(bookingData.checkOut).toLocaleDateString()} (11:00 AM)</strong>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted d-block">Total Nights:</span>
                      <strong>{bookingData.totalNights} Night(s)</strong>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted d-block">Total Paid:</span>
                      <strong className="text-success fs-6">${bookingData.totalAmount} USD</strong>
                    </div>
                  </div>
                </div>

                {/* Next Action Links */}
                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Link to="/my-bookings" className="btn btn-hp-gold px-4">
                    <FaReceipt className="me-2" />
                    <span>View In My Bookings</span>
                  </Link>
                  <Link to="/" className="btn btn-outline-secondary px-4">
                    <span>Return to Homepage</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
