import React from 'react';
import { Link } from 'react-router-dom';
import { FaCrown, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaShieldAlt, FaStar, FaCreditCard } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="hp-footer">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="hp-brand mb-3 d-inline-flex">
              <FaCrown className="hp-brand-gold fs-4" />
              <span>
                HOTEL<span className="hp-brand-gold">PRO</span>
              </span>
            </Link>
            <p className="text-white-50 small pe-lg-3 mt-2">
              HotelPro stands as the pinnacle of bespoke hospitality, combining classical grandeur with
              contemporary luxury. Dedicated to world-class comfort, exquisite dining, and unforgettable experiences.
            </p>
            <div className="d-flex align-items-center gap-2 mt-3 text-warning small">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              <span className="text-white-50 ps-1">5-Star Luxury Certified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h5>Navigation</h5>
            <Link to="/" className="hp-footer-link">Home</Link>
            <Link to="/rooms" className="hp-footer-link">Suites & Rooms</Link>
            <Link to="/my-bookings" className="hp-footer-link">My Reservations</Link>
            <Link to="/login" className="hp-footer-link">Customer Portal</Link>
            <a href="/#about" className="hp-footer-link">About Our Estate</a>
          </div>

          {/* Hospitality Services */}
          <div className="col-lg-3 col-md-6">
            <h5>Signature Amenities</h5>
            <span className="hp-footer-link">Heated Infinity Pool</span>
            <span className="hp-footer-link">Michelin 3-Star Dining</span>
            <span className="hp-footer-link">Thermal Sanctuary & Spa</span>
            <span className="hp-footer-link">Bespoke Valet & Concierge</span>
            <span className="hp-footer-link">Private Helicopter Lounge</span>
          </div>

          {/* 24/7 Concierge Contact */}
          <div className="col-lg-3 col-md-6">
            <h5>24/7 Concierge</h5>
            <div className="d-flex align-items-start gap-2 text-white-50 small mb-2">
              <FaMapMarkerAlt className="text-warning mt-1 flex-shrink-0" />
              <span>777 Grand Riviera Promenade, Suite 100, Coastal Haven</span>
            </div>
            <div className="d-flex align-items-center gap-2 text-white-50 small mb-2">
              <FaPhoneAlt className="text-warning flex-shrink-0" />
              <span>+1 (800) 555-HOTEL (0199)</span>
            </div>
            <div className="d-flex align-items-center gap-2 text-white-50 small mb-3">
              <FaEnvelope className="text-warning flex-shrink-0" />
              <span>concierge@hotelpro.com</span>
            </div>
            <div className="p-2 bg-dark rounded border border-secondary text-white-50 small d-flex align-items-center gap-2">
              <FaShieldAlt className="text-success fs-5" />
              <span>PCI-DSS Secured Sandbox Checkout</span>
            </div>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="hp-footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 text-white-50">
          <div>
            &copy; {new Date().getFullYear()} HotelPro Luxury Resorts & Hospitality Inc. All rights reserved.
          </div>
          <div className="d-flex gap-3">
            <span className="cursor-pointer hover-gold">Privacy Policy</span>
            <span>&bull;</span>
            <span className="cursor-pointer hover-gold">Terms of Stay</span>
            <span>&bull;</span>
            <span className="cursor-pointer hover-gold">Cancellation Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
