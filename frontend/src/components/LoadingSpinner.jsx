import React from 'react';

const LoadingSpinner = ({ message = 'Loading HotelPro...', fullPage = false }) => {
  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div
        className="spinner-border text-warning mb-3"
        style={{ width: '3rem', height: '3rem', borderWidth: '3px' }}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted fw-semibold mb-0" style={{ letterSpacing: '0.03em' }}>
        {message}
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '60vh' }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
