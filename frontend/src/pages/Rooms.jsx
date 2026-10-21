import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { FaFilter, FaRedo, FaSearch, FaCalendarAlt, FaUserFriends, FaBed, FaDollarSign } from 'react-icons/fa';

const Rooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [capacity, setCapacity] = useState(searchParams.get('capacity') || '1');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '600');
  const [keyword, setKeyword] = useState('');

  // Fetch rooms whenever filters or search query changes
  const fetchFilteredRooms = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (type && type !== 'all') params.type = type;
      if (checkIn && checkOut) {
        params.checkIn = checkIn;
        params.checkOut = checkOut;
      }
      if (capacity && Number(capacity) > 1) params.capacity = capacity;
      if (maxPrice) params.maxPrice = maxPrice;
      if (keyword) params.search = keyword;

      const res = await api.get('/rooms', { params });
      if (res.data?.success) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve available suites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredRooms();
  }, [type, capacity, maxPrice]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchFilteredRooms();
  };

  const handleResetFilters = () => {
    setType('all');
    setCheckIn('');
    setCheckOut('');
    setCapacity('1');
    setMaxPrice('600');
    setKeyword('');
    setSearchParams({});
    setTimeout(() => {
      api.get('/rooms').then((res) => {
        if (res.data?.success) setRooms(res.data.rooms);
      });
    }, 50);
  };

  return (
    <div className="py-5">
      <div className="container">
        {/* Page Header */}
        <div className="text-center max-w-xl mx-auto mb-5">
          <span className="text-warning fw-bold text-uppercase tracking-wider small">
            LUXURY ACCOMMODATIONS
          </span>
          <h1 className="display-5 fw-bold hp-serif text-dark mt-1">
            Our Suites & Residences
          </h1>
          <p className="text-muted">
            Filter our curated collection by dates, room type, or capacity to find your ideal stay.
          </p>
        </div>

        {/* Filter Toolbar / Panel */}
        <div className="hp-glass-panel p-4 mb-5">
          <form onSubmit={handleApplyFilters}>
            <div className="row g-3 align-items-end">
              {/* Keyword / Room Number */}
              <div className="col-lg-3 col-md-6">
                <label className="form-label small fw-bold text-secondary text-uppercase tracking-wider mb-1">
                  <FaSearch className="text-warning me-1" /> Search Keyword
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Oceanfront, Penthouse..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              {/* Check-In Date */}
              <div className="col-lg-2 col-md-6">
                <label className="form-label small fw-bold text-secondary text-uppercase tracking-wider mb-1">
                  <FaCalendarAlt className="text-warning me-1" /> Check-In
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              {/* Check-Out Date */}
              <div className="col-lg-2 col-md-6">
                <label className="form-label small fw-bold text-secondary text-uppercase tracking-wider mb-1">
                  <FaCalendarAlt className="text-warning me-1" /> Check-Out
                </label>
                <input
                  type="date"
                  className="form-control"
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              {/* Room Type */}
              <div className="col-lg-2 col-md-6">
                <label className="form-label small fw-bold text-secondary text-uppercase tracking-wider mb-1">
                  <FaBed className="text-warning me-1" /> Room Type
                </label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="Family">Family</option>
                </select>
              </div>

              {/* Guests */}
              <div className="col-lg-1 col-md-6">
                <label className="form-label small fw-bold text-secondary text-uppercase tracking-wider mb-1">
                  <FaUserFriends className="text-warning me-1" /> Guests
                </label>
                <select
                  className="form-select"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                >
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              {/* Actions */}
              <div className="col-lg-2 col-md-12 d-flex gap-2">
                <button type="submit" className="btn btn-hp-gold flex-grow-1">
                  Filter
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-outline-secondary"
                  title="Reset Filters"
                >
                  <FaRedo />
                </button>
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="row mt-3 pt-3 border-top border-light-subtle align-items-center">
              <div className="col-md-6 d-flex align-items-center gap-3">
                <label className="small fw-bold text-secondary text-uppercase tracking-wider mb-0 text-nowrap">
                  Max Price / Night: <span className="text-warning">${maxPrice}</span>
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="100"
                  max="600"
                  step="25"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              {checkIn && checkOut && (
                <div className="col-md-6 text-md-end text-muted small mt-2 mt-md-0">
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 p-2">
                    Date Filter Active: Showing only available suites between {checkIn} & {checkOut}
                  </span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Results Counter & List */}
        {error && (
          <div className="alert alert-danger shadow-sm mb-4" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Searching available hotel suites..." />
        ) : rooms.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border border-light-subtle shadow-sm my-4">
            <FaBed className="text-warning fs-1 mb-3 opacity-50" />
            <h4 className="fw-bold hp-serif text-dark">No Suites Available For Your Criteria</h4>
            <p className="text-muted small max-w-md mx-auto mb-4">
              We couldn't find any rooms matching your selected dates, guest capacity, or price range.
              Try adjusting your travel dates or resetting your filters.
            </p>
            <button onClick={handleResetFilters} className="btn btn-hp-outline-gold">
              Reset All Filters
            </button>
          </div>
        ) : (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0 fw-bold text-dark">
                Showing <span className="text-warning">{rooms.length}</span> luxury suite{rooms.length > 1 ? 's' : ''}
              </h5>
            </div>

            <div className="row g-4">
              {rooms.map((room) => (
                <div key={room._id} className="col-lg-4 col-md-6">
                  <RoomCard room={room} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
