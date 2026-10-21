import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserFriends, FaBed, FaWifi, FaArrowRight, FaCheckCircle } from 'react-icons/fa';

const RoomCard = ({ room }) => {
  // Format image URL properly whether external Unsplash or local Multer upload
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80';
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    return `${backendBase}${imagePath}`;
  };

  const mainImage = room.images && room.images.length > 0 ? getImageUrl(room.images[0]) : getImageUrl(null);

  return (
    <div className="hp-card h-100 d-flex flex-column">
      {/* Image Header with floating tags */}
      <div className="room-card-img-wrapper">
        <img
          src={mainImage}
          alt={room.name}
          className="room-card-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="room-type-badge">{room.type} Suite</div>
        <div className="room-price-badge">
          ${room.pricePerNight}
          <small>/night</small>
        </div>
      </div>

      {/* Room Details Body */}
      <div className="p-4 d-flex flex-column flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="text-muted small fw-semibold text-uppercase tracking-wider">
            Room #{room.roomNumber}
          </span>
          <span className="d-flex align-items-center gap-1 text-muted small fw-semibold">
            <FaUserFriends className="text-warning" />
            <span>Up to {room.capacity} Guest{room.capacity > 1 ? 's' : ''}</span>
          </span>
        </div>

        <h4 className="fw-bold mb-2 hp-serif text-dark fs-5">{room.name}</h4>

        <p className="text-muted small mb-3 flex-grow-1 text-truncate-2" style={{ minHeight: '2.5rem' }}>
          {room.description}
        </p>

        {/* Amenities preview */}
        <div className="d-flex flex-wrap gap-1 mb-4">
          {room.amenities && room.amenities.slice(0, 3).map((amenity, idx) => (
            <span key={idx} className="amenity-chip">
              <FaCheckCircle className="text-warning fs-xs" />
              <span>{amenity}</span>
            </span>
          ))}
          {room.amenities && room.amenities.length > 3 && (
            <span className="amenity-chip text-muted">+{room.amenities.length - 3} more</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 pt-2 border-top border-light-subtle">
          <Link to={`/rooms/${room._id}`} className="btn btn-hp-navy btn-sm flex-fill text-center justify-content-center">
            View Details
          </Link>
          <Link
            to={`/booking/${room._id}`}
            className="btn btn-hp-gold btn-sm flex-fill text-center justify-content-center"
          >
            <span>Book Now</span>
            <FaArrowRight className="fs-xs" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
