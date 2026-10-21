import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel';
import RoomCard from '../components/RoomCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import {
  FaSwimmingPool,
  FaUtensils,
  FaSpa,
  FaConciergeBell,
  FaWifi,
  FaCar,
  FaAward,
  FaStar,
  FaShieldAlt,
  FaQuoteLeft,
  FaArrowRight
} from 'react-icons/fa';

const HomePage = () => {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/rooms');
        if (res.data?.success) {
          // Take top 3 or 4 rooms as featured
          setFeaturedRooms(res.data.rooms.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load featured rooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div>
      {/* 1. Large Hero Section with Carousel & Search */}
      <HeroCarousel />

      {/* 2. Key Highlights Bar */}
      <section className="bg-white py-4 border-bottom border-light shadow-sm">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-6 col-md-3 border-end">
              <h3 className="fw-bold hp-serif text-dark mb-0">5-Star</h3>
              <p className="text-muted small mb-0">Global Luxury Rating</p>
            </div>
            <div className="col-6 col-md-3 border-end">
              <h3 className="fw-bold hp-serif text-dark mb-0">100%</h3>
              <p className="text-muted small mb-0">Verified Guest Reviews</p>
            </div>
            <div className="col-6 col-md-3 border-end">
              <h3 className="fw-bold hp-serif text-dark mb-0">24 / 7</h3>
              <p className="text-muted small mb-0">Bespoke Concierge & Valet</p>
            </div>
            <div className="col-6 col-md-3">
              <h3 className="fw-bold hp-serif text-dark mb-0">0%</h3>
              <p className="text-muted small mb-0">Hidden Booking Fees</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Rooms & Suites Showcase */}
      <section className="py-5 my-3">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <span className="text-warning fw-bold text-uppercase tracking-wider small">
                DISCOVER OUR SANCTUARIES
              </span>
              <h2 className="display-6 fw-bold hp-serif text-dark mt-1 mb-0">
                Featured Suites & Residences
              </h2>
            </div>
            <Link to="/rooms" className="btn btn-hp-outline-gold mt-3 mt-md-0">
              <span>View All Suites</span>
              <FaArrowRight className="fs-xs" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Curating premium suites..." />
          ) : (
            <div className="row g-4">
              {featuredRooms.map((room) => (
                <div key={room._id} className="col-lg-4 col-md-6">
                  <RoomCard room={room} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. About HotelPro Section */}
      <section id="about" className="py-5 bg-white border-top border-bottom border-light">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="position-relative pe-lg-3">
                <img
                  src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80"
                  alt="HotelPro Architecture"
                  className="img-fluid rounded-4 shadow-lg w-100"
                />
                <div
                  className="position-absolute bottom-0 start-0 m-4 p-3 bg-dark bg-opacity-90 rounded-3 text-white border border-warning shadow"
                  style={{ maxWidth: '280px' }}
                >
                  <div className="d-flex align-items-center gap-2 text-warning mb-1">
                    <FaAward className="fs-4" />
                    <span className="fw-bold small">Heritage of Excellence</span>
                  </div>
                  <p className="small text-white-50 mb-0">
                    Named Best Coastal Luxury Resort & Spa of the Year 2026.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <span className="text-warning fw-bold text-uppercase tracking-wider small">
                ABOUT OUR ESTATE
              </span>
              <h2 className="display-6 fw-bold hp-serif text-dark mt-1 mb-3">
                A Symphony of Architectural Grandeur & Coastal Serenity
              </h2>
              <p className="text-secondary mb-3">
                Nestled along prestigious shores, HotelPro is designed as a sublime haven where architectural majesty
                meets intuitive warmth. Every guestroom, terrace, and private lounge has been meticulously crafted to
                inspire peace, romance, and unparalleled refinement.
              </p>
              <p className="text-secondary mb-4">
                Whether unwinding in our thermal mineral baths, indulging in curated wine tastings, or embarking on
                scenic yacht excursions, our dedicated team is at your command around the clock.
              </p>

              <div className="row g-3 pt-2">
                <div className="col-sm-6">
                  <div className="d-flex align-items-center gap-2">
                    <FaShieldAlt className="text-warning fs-5" />
                    <span className="fw-semibold text-dark">Strict Privacy Guaranteed</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-center gap-2">
                    <FaConciergeBell className="text-warning fs-5" />
                    <span className="fw-semibold text-dark">24/7 Dedicated Butler</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-center gap-2">
                    <FaUtensils className="text-warning fs-5" />
                    <span className="fw-semibold text-dark">Private In-Suite Dining</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-center gap-2">
                    <FaCar className="text-warning fs-5" />
                    <span className="fw-semibold text-dark">Chauffeur Airport Transfer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Services & Amenities Section */}
      <section id="services" className="py-5 my-3">
        <div className="container">
          <div className="text-center max-w-xl mx-auto mb-5">
            <span className="text-warning fw-bold text-uppercase tracking-wider small">
              UNCOMPROMISING LUXURY
            </span>
            <h2 className="display-6 fw-bold hp-serif text-dark mt-1">
              Curated Services & Signature Amenities
            </h2>
            <p className="text-muted">
              Elevate every moment of your stay with our award-winning facilities and bespoke offerings.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="hp-card p-4 h-100">
                <div className="kpi-icon-box bg-warning bg-opacity-10 text-warning mb-3">
                  <FaSwimmingPool />
                </div>
                <h4 className="fw-bold hp-serif text-dark fs-5">Heated Oceanfront Infinity Pool</h4>
                <p className="text-muted small mb-0">
                  Suspended over azure waves with private cabanas, complimentary sun care, and handcrafted cocktail service.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="hp-card p-4 h-100">
                <div className="kpi-icon-box bg-warning bg-opacity-10 text-warning mb-3">
                  <FaUtensils />
                </div>
                <h4 className="fw-bold hp-serif text-dark fs-5">Michelin-Starred Gastronomy</h4>
                <p className="text-muted small mb-0">
                  Four distinctive dining venues led by world-renowned chefs, celebrating farm-to-table coastal cuisine.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="hp-card p-4 h-100">
                <div className="kpi-icon-box bg-warning bg-opacity-10 text-warning mb-3">
                  <FaSpa />
                </div>
                <h4 className="fw-bold hp-serif text-dark fs-5">Thermal Sanctuary & Spa</h4>
                <p className="text-muted small mb-0">
                  Holistic rejuvenating therapies, cedar saunas, Himalayan salt rooms, and bespoke Ayurvedic rituals.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="hp-card p-4 h-100">
                <div className="kpi-icon-box bg-warning bg-opacity-10 text-warning mb-3">
                  <FaConciergeBell />
                </div>
                <h4 className="fw-bold hp-serif text-dark fs-5">Bespoke Concierge & Valet</h4>
                <p className="text-muted small mb-0">
                  From private helicopter charters to opera reservations, our concierge team turns desires into reality.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="hp-card p-4 h-100">
                <div className="kpi-icon-box bg-warning bg-opacity-10 text-warning mb-3">
                  <FaWifi />
                </div>
                <h4 className="fw-bold hp-serif text-dark fs-5">Fiber Wi-Fi & Smart Suites</h4>
                <p className="text-muted small mb-0">
                  Ultra-fast gigabit connectivity, automated mood lighting, climate presets, and in-room iPad control.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="hp-card p-4 h-100">
                <div className="kpi-icon-box bg-warning bg-opacity-10 text-warning mb-3">
                  <FaCar />
                </div>
                <h4 className="fw-bold hp-serif text-dark fs-5">Private Fleet & Airport Chauffeur</h4>
                <p className="text-muted small mb-0">
                  Complimentary luxury sedan transfers from the airport directly to our private estate entrance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Testimonials */}
      <section className="py-5 bg-white border-top border-bottom border-light">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-warning fw-bold text-uppercase tracking-wider small">
              WORDS FROM OUR GUESTS
            </span>
            <h2 className="display-6 fw-bold hp-serif text-dark mt-1">
              Guest Testimonials
            </h2>
            <p className="text-muted">
              Discover what discerning travelers cherish most about their HotelPro stays.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <div className="hp-card-static p-4 h-100 d-flex flex-column bg-light border-0">
                <div className="text-warning mb-3">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
                <FaQuoteLeft className="text-warning opacity-25 fs-2 mb-2" />
                <p className="text-secondary small fst-italic flex-grow-1">
                  "The Oceanfront Deluxe suite exceeded all our expectations. Watching the sunset from the private soaking tub
                  while sipping chilled champagne was magical. The staff anticipates your every need."
                </p>
                <div className="d-flex align-items-center gap-3 pt-3 border-top border-light-subtle">
                  <div
                    className="rounded-circle bg-dark text-warning fw-bold d-flex align-items-center justify-content-center"
                    style={{ width: '42px', height: '42px' }}
                  >
                    CV
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-dark">Claire & Julian Vance</h6>
                    <small className="text-muted">Stayed in Suite 301 &bull; Oct 2026</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="hp-card-static p-4 h-100 d-flex flex-column bg-light border-0">
                <div className="text-warning mb-3">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
                <FaQuoteLeft className="text-warning opacity-25 fs-2 mb-2" />
                <p className="text-secondary small fst-italic flex-grow-1">
                  "As a frequent international business traveler, seamless check-in and absolute silence are paramount.
                  HotelPro delivers impeccably. The executive workspace and high-speed fiber allowed me to work flawlessly."
                </p>
                <div className="d-flex align-items-center gap-3 pt-3 border-top border-light-subtle">
                  <div
                    className="rounded-circle bg-dark text-warning fw-bold d-flex align-items-center justify-content-center"
                    style={{ width: '42px', height: '42px' }}
                  >
                    DK
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-dark">David K. Morrison</h6>
                    <small className="text-muted">Stayed in Executive Solo &bull; Sep 2026</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="hp-card-static p-4 h-100 d-flex flex-column bg-light border-0">
                <div className="text-warning mb-3">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
                <FaQuoteLeft className="text-warning opacity-25 fs-2 mb-2" />
                <p className="text-secondary small fst-italic flex-grow-1">
                  "Our multi-generational family retreat in the Signature Family Garden Residence was sheer perfection.
                  The adjoining rooms gave privacy to parents while children enjoyed the secure garden patio."
                </p>
                <div className="d-flex align-items-center gap-3 pt-3 border-top border-light-subtle">
                  <div
                    className="rounded-circle bg-dark text-warning fw-bold d-flex align-items-center justify-content-center"
                    style={{ width: '42px', height: '42px' }}
                  >
                    AR
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-dark">Amara & Ethan Rossi</h6>
                    <small className="text-muted">Stayed in Family Residence &bull; Aug 2026</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #0c152e 0%, #142145 100%)' }}>
        <div className="container text-center py-4">
          <span className="text-warning fw-bold text-uppercase tracking-wider small">
            YOUR BESPOKE GETAWAY AWAITS
          </span>
          <h2 className="display-5 fw-bold text-white hp-serif mt-2 mb-3">
            Reserve Your Exclusive Luxury Suite Today
          </h2>
          <p className="lead text-white-50 mx-auto mb-4" style={{ maxWidth: '650px' }}>
            Book directly through our official portal for complimentary breakfast, priority spa reservations, and flexible cancellation.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/rooms" className="btn btn-hp-gold btn-lg px-4">
              Explore Available Rooms
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
