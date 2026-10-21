import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUserFriends, FaBed, FaSearch, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=85',
    tagline: 'SANCTUARY OF TIMELESS OPULENCE',
    title: 'Experience Unrivaled Luxury & Distinction',
    subtitle: 'Immerse in breathtaking coastal views, bespoke butler service, and Michelin-starred culinary artistry.'
  },
  {
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=85',
    tagline: 'PRIVATE ROOFTOP & PANORAMIC SUITES',
    title: 'Your Private Haven Above The Horizon',
    subtitle: 'Indulge in handcrafted suites designed for discerning travelers seeking serenity, elegance, and peace.'
  },
  {
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=85',
    tagline: 'WORLD-CLASS WELLNESS & TRANQUILITY',
    title: 'Where Grand Architecture Meets Serenity',
    subtitle: 'From thermal infinity pools to signature wellness therapies, rejuvenate body and mind with HotelPro.'
  }
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Search form state
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [capacity, setCapacity] = useState('2');
  const [roomType, setRoomType] = useState('all');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (capacity) params.append('capacity', capacity);
    if (roomType && roomType !== 'all') params.append('type', roomType);

    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div className="hero-wrapper">
      {/* Background Slides */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      ))}

      {/* Dark Luxury Overlay */}
      <div className="hero-overlay" />

      {/* Hero Content & Search Bar */}
      <div className="container hero-content">
        <div className="row justify-content-center text-center mb-4">
          <div className="col-xl-9 col-lg-10">
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-3 rounded-pill bg-dark bg-opacity-50 border border-warning text-warning small fw-semibold tracking-wider">
              <FaStar />
              <span>{slides[currentSlide].tagline}</span>
              <FaStar />
            </div>

            <h1 className="display-4 fw-bold text-white mb-3 hp-serif">
              {slides[currentSlide].title}
            </h1>

            <p className="lead text-white-50 mb-4 px-md-5">
              {slides[currentSlide].subtitle}
            </p>
          </div>
        </div>

        {/* Integrated Quick Search Box */}
        <div className="row justify-content-center">
          <div className="col-xl-11 col-lg-12">
            <div className="hero-search-box">
              <form onSubmit={handleSearch}>
                <div className="row g-3 align-items-end">
                  {/* Check In */}
                  <div className="col-lg-3 col-md-6">
                    <label className="form-label small fw-bold text-secondary text-uppercase tracking-wider mb-1">
                      <FaCalendarAlt className="text-warning me-1" /> Check-In Date
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-lg bg-light"
                      min={today}
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      required
                    />
                  </div>

                  {/* Check Out */}
                  <div className="col-lg-3 col-md-6">
                    <label className="form-label small fw-bold text-secondary text-uppercase tracking-wider mb-1">
                      <FaCalendarAlt className="text-warning me-1" /> Check-Out Date
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-lg bg-light"
                      min={checkIn || today}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                    />
                  </div>

                  {/* Guests */}
                  <div className="col-lg-2 col-md-6">
                    <label className="form-label small fw-bold text-secondary text-uppercase tracking-wider mb-1">
                      <FaUserFriends className="text-warning me-1" /> Guests
                    </label>
                    <select
                      className="form-select form-select-lg bg-light"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                      <option value="5">5+ Guests</option>
                    </select>
                  </div>

                  {/* Suite Type */}
                  <div className="col-lg-2 col-md-6">
                    <label className="form-label small fw-bold text-secondary text-uppercase tracking-wider mb-1">
                      <FaBed className="text-warning me-1" /> Suite Type
                    </label>
                    <select
                      className="form-select form-select-lg bg-light"
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                    >
                      <option value="all">All Room Types</option>
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Suite">Suite</option>
                      <option value="Family">Family</option>
                    </select>
                  </div>

                  {/* Search Button */}
                  <div className="col-lg-2 col-md-12">
                    <button
                      type="submit"
                      className="btn btn-hp-gold btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                      <FaSearch />
                      <span>Search</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Carousel Slide Indicators */}
        <div className="d-flex justify-content-center gap-2 mt-4">
          {slides.map((_, idx) => (
            <button
              key={idx}
              className={`btn p-0 rounded-pill ${
                idx === currentSlide ? 'bg-warning' : 'bg-white bg-opacity-25'
              }`}
              style={{ width: idx === currentSlide ? '32px' : '10px', height: '8px', transition: 'all 0.3s' }}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
