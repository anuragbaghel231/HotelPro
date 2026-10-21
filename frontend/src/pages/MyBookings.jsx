import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import {
  FaCalendarCheck,
  FaCalendarAlt,
  FaReceipt,
  FaTimesCircle,
  FaCheckCircle,
  FaBed,
  FaDollarSign,
  FaPrint,
  FaInfoCircle
} from 'react-icons/fa';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  // Cancel modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState(null);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my');
      if (res.data?.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve your reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    setCancelling(true);
    setCancelMessage(null);

    try {
      const res = await api.patch(`/bookings/${selectedBooking._id}/cancel`);
      if (res.data?.success) {
        setCancelMessage({
          success: true,
          text: res.data.message || 'Booking cancelled successfully.',
          refund: res.data.refund
        });
        // Refresh bookings
        await fetchMyBookings();
      }
    } catch (err) {
      setCancelMessage({
        success: false,
        text: err.message || 'Failed to cancel booking.'
      });
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="hp-badge hp-badge-confirmed">Confirmed</span>;
      case 'pending':
        return <span className="hp-badge hp-badge-pending">Pending</span>;
      case 'cancelled':
        return <span className="hp-badge hp-badge-cancelled">Cancelled</span>;
      case 'completed':
        return <span className="hp-badge hp-badge-completed">Completed</span>;
      default:
        return <span className="hp-badge">{status}</span>;
    }
  };

  const getPaymentBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return <span className="hp-badge hp-badge-paid">Paid</span>;
      case 'refunded':
        return <span className="hp-badge hp-badge-refunded">Refunded</span>;
      case 'pending':
        return <span className="hp-badge hp-badge-pending">Payment Pending</span>;
      case 'failed':
        return <span className="hp-badge hp-badge-failed">Payment Failed</span>;
      default:
        return <span className="hp-badge">{paymentStatus}</span>;
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  return (
    <div className="py-5">
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <span className="text-warning fw-bold text-uppercase tracking-wider small">
              CUSTOMER PORTAL
            </span>
            <h1 className="display-6 fw-bold hp-serif text-dark mt-1 mb-0">
              My Reservations
            </h1>
          </div>
          <Link to="/rooms" className="btn btn-hp-gold mt-3 mt-md-0">
            <span>Explore More Suites</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
          {['all', 'confirmed', 'pending', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`btn btn-sm text-capitalize px-3 rounded-pill ${
                filter === tab ? 'btn-dark text-warning fw-bold' : 'btn-outline-secondary'
              }`}
            >
              {tab === 'all' ? `All Reservations (${bookings.length})` : tab}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <LoadingSpinner message="Retrieving your reservation history..." />
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border border-light-subtle shadow-sm my-4">
            <FaCalendarCheck className="text-warning fs-1 mb-3 opacity-50" />
            <h4 className="fw-bold hp-serif text-dark">No Reservations Found</h4>
            <p className="text-muted small max-w-md mx-auto mb-4">
              {filter === 'all'
                ? "You haven't made any suite reservations yet. Browse our luxury suites to book your getaway."
                : `You currently have no ${filter} reservations.`}
            </p>
            <Link to="/rooms" className="btn btn-hp-gold">
              Browse Available Suites
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {filteredBookings.map((b) => {
              const isEligibleToCancel =
                b.status !== 'cancelled' &&
                b.status !== 'completed' &&
                new Date(b.checkIn) > new Date();

              return (
                <div key={b._id} className="col-12">
                  <div className="hp-card p-4">
                    <div className="row g-4 align-items-center">
                      {/* Room Photo */}
                      <div className="col-md-3">
                        <img
                          src={
                            b.room?.images?.[0] ||
                            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={b.room?.name || 'HotelPro Suite'}
                          className="rounded-3 object-fit-cover w-100"
                          style={{ height: '160px' }}
                        />
                      </div>

                      {/* Main Details */}
                      <div className="col-md-6">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="font-monospace small fw-bold text-muted">
                            Ref: {b.bookingId}
                          </span>
                          {getStatusBadge(b.status)}
                          {getPaymentBadge(b.paymentStatus)}
                        </div>

                        <h4 className="fw-bold hp-serif text-dark mb-1">
                          {b.room?.name || 'Exclusive Suite'}
                        </h4>
                        <p className="text-muted small mb-2">
                          Room #{b.room?.roomNumber} &bull; {b.room?.type} Suite
                        </p>

                        <div className="row g-2 text-muted small mt-2">
                          <div className="col-sm-6">
                            <span>Check-In: </span>
                            <strong className="text-dark">
                              {new Date(b.checkIn).toLocaleDateString()}
                            </strong>
                          </div>
                          <div className="col-sm-6">
                            <span>Check-Out: </span>
                            <strong className="text-dark">
                              {new Date(b.checkOut).toLocaleDateString()}
                            </strong>
                          </div>
                          <div className="col-sm-6">
                            <span>Guest: </span>
                            <strong className="text-dark">{b.guestName}</strong>
                          </div>
                          <div className="col-sm-6">
                            <span>Duration: </span>
                            <strong className="text-dark">{b.totalNights} Night(s)</strong>
                          </div>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="col-md-3 text-md-end border-start-md ps-md-4">
                        <small className="text-muted text-uppercase d-block mb-1">
                          Total Amount
                        </small>
                        <h3 className="fw-bold text-dark mb-3">
                          ${b.totalAmount}{' '}
                          <small className="fs-6 text-muted fw-normal">USD</small>
                        </h3>

                        <div className="d-flex flex-column gap-2">
                          {b.paymentStatus === 'pending' && b.status === 'pending' && (
                            <Link
                              to={`/booking/${b.room?._id}`}
                              className="btn btn-warning btn-sm"
                            >
                              Complete Payment
                            </Link>
                          )}

                          {isEligibleToCancel && (
                            <button
                              onClick={() => {
                                setSelectedBooking(b);
                                setCancelMessage(null);
                              }}
                              className="btn btn-outline-danger btn-sm"
                              data-bs-toggle="modal"
                              data-bs-target="#cancelModal"
                            >
                              Cancel Reservation
                            </button>
                          )}

                          <button
                            onClick={() => window.print()}
                            className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center gap-1"
                          >
                            <FaPrint className="fs-xs" />
                            <span>Print Voucher</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cancellation Modal */}
        {selectedBooking && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold hp-serif text-dark">
                    Confirm Reservation Cancellation
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedBooking(null)}
                  />
                </div>

                <div className="modal-body py-4">
                  {cancelMessage ? (
                    <div
                      className={`alert ${
                        cancelMessage.success ? 'alert-success' : 'alert-danger'
                      } mb-0`}
                    >
                      <h6 className="fw-bold mb-1">{cancelMessage.text}</h6>
                      {cancelMessage.refund && (
                        <div className="small mt-2 pt-2 border-top border-success-subtle">
                          <div>
                            <strong>Refunded:</strong> ${cancelMessage.refund.refundedAmount} USD
                          </div>
                          <div>
                            <strong>Refund Ref:</strong> {cancelMessage.refund.refundTransactionId}
                          </div>
                          <div className="text-muted mt-1">{cancelMessage.refund.message}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-secondary mb-3">
                        Are you sure you wish to cancel reservation{' '}
                        <strong>{selectedBooking.bookingId}</strong> for{' '}
                        <strong>{selectedBooking.room?.name}</strong>?
                      </p>

                      <div className="p-3 bg-light rounded-3 small mb-3 border border-light-subtle">
                        <div className="d-flex align-items-start gap-2">
                          <FaInfoCircle className="text-warning mt-1 flex-shrink-0" />
                          <div>
                            <strong>HotelPro Cancellation & Refund Policy:</strong>
                            <p className="mb-0 text-muted mt-1">
                              {selectedBooking.paymentStatus === 'paid'
                                ? `Because this reservation was paid in full, cancelling now will automatically trigger a 100% refund of $${selectedBooking.totalAmount} USD via the payment sandbox.`
                                : 'No payment has been collected for this reservation. The reservation will simply be cancelled.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer border-0 pt-0">
                  {cancelMessage ? (
                    <button
                      type="button"
                      className="btn btn-secondary w-100"
                      onClick={() => setSelectedBooking(null)}
                    >
                      Close
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        disabled={cancelling}
                        onClick={() => setSelectedBooking(null)}
                      >
                        Keep Reservation
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        disabled={cancelling}
                        onClick={handleCancelBooking}
                      >
                        {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
