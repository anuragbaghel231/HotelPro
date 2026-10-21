import React from 'react';
import { Link } from 'react-router-dom';
import { FaCrown, FaCompass } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div
      className="py-5 d-flex align-items-center justify-content-center text-center"
      style={{ minHeight: '70vh' }}
    >
      <div className="container">
        <FaCrown className="text-warning fs-1 mb-3" />
        <h1 className="display-1 fw-bold hp-serif text-dark mb-2">404</h1>
        <h3 className="fw-bold text-secondary mb-3">Suite Page Not Found</h3>
        <p className="text-muted mx-auto mb-4" style={{ maxWidth: '450px' }}>
          The requested page or accommodation could not be located in our catalog. It may have been
          moved or does not exist.
        </p>
        <Link to="/" className="btn btn-hp-gold">
          <FaCompass className="me-2" />
          <span>Return to HotelPro Homepage</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
