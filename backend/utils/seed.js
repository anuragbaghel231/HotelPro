require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Room = require('../models/roomModel');
const Booking = require('../models/bookingModel');
const Payment = require('../models/paymentModel');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections (fresh bootstrap)...');
    await Promise.all([
      User.deleteMany({}),
      Room.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({})
    ]);

    console.log('[Seed] Seeding administrators and sample customer accounts...');
    const adminUser = await User.create({
      name: 'Alexander Sterling (GM)',
      email: 'admin@hotelpro.com',
      password: 'Admin@12345',
      phone: '+1 (800) 555-0199',
      role: 'admin'
    });

    const customerUser = await User.create({
      name: 'Eleanor Vance',
      email: 'customer@hotelpro.com',
      password: 'Customer@12345',
      phone: '+1 (555) 234-5678',
      role: 'customer'
    });

    const secondCustomer = await User.create({
      name: 'Marcus Brody',
      email: 'marcus@hotelpro.com',
      password: 'Customer@12345',
      phone: '+1 (555) 876-5432',
      role: 'customer'
    });

    console.log('[Seed] Seeding luxury hotel rooms...');
    const rooms = await Room.create([
      {
        roomNumber: '101',
        name: 'Grand Executive Solo Suite',
        type: 'Single',
        pricePerNight: 3500,
        capacity: 1,
        description:
          'Elegantly crafted for discerning solo travelers and business executives. Features an ergonomic workspace, plush queen-single bedding, marble rainfall shower, and high-speed fiber internet.',
        amenities: [
          'High-Speed Wi-Fi',
          'Ergonomic Work Desk',
          'Smart 4K HDTV',
          'Rainfall Shower',
          'Nespresso Coffee Maker',
          'Climate Control'
        ],
        images: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
        ],
        isActive: true
      },
      {
        roomNumber: '201',
        name: 'Deluxe Courtyard King',
        type: 'Double',
        pricePerNight: 5500,
        capacity: 2,
        description:
          'A tranquil retreat boasting expansive courtyard views. Includes a custom pillow-top King bed, private balcony, walk-in vanity, and complimentary evening turndown service.',
        amenities: [
          'King Bed',
          'Private Garden Balcony',
          'Smart 4K HDTV',
          'Minibar & Wine Cooler',
          'Italian Marble Bath',
          'Bathrobes & Slippers'
        ],
        images: [
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
        ],
        isActive: true
      },
      {
        roomNumber: '301',
        name: 'Oceanfront Azure Deluxe',
        type: 'Deluxe',
        pricePerNight: 8500,
        capacity: 2,
        description:
          'Unrivaled direct ocean panoramas with floor-to-ceiling soundproof glass. Unwind in a standalone whirlpool soaking tub overlooking azure waves and coastal sunsets.',
        amenities: [
          'Direct Oceanfront View',
          'Jacuzzi Soaking Tub',
          'California King Bed',
          'Complimentary Gourmet Breakfast',
          'Bose Sound System',
          '24/7 Room Concierge'
        ],
        images: [
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'
        ],
        isActive: true
      },
      {
        roomNumber: '401',
        name: 'The Royal Ambassador Penthouse Suite',
        type: 'Suite',
        pricePerNight: 18000,
        capacity: 4,
        description:
          'The epitome of luxury hospitality. Spans over 1,400 sq.ft featuring a sprawling private terrace, separate dining parlor, walk-in dressing room, private dry sauna, and dedicated butler concierge.',
        amenities: [
          'Panoramic Rooftop Terrace',
          'Private Butler Service',
          'Private In-Suite Sauna',
          'Separate Living & Dining Salon',
          'Full Kitchenette & Wine Cellar',
          'Limousine Airport Transfer'
        ],
        images: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=1200&q=80'
        ],
        isActive: true
      },
      {
        roomNumber: '501',
        name: 'Signature Family Garden Residence',
        type: 'Family',
        pricePerNight: 12000,
        capacity: 5,
        description:
          'Spacious, family-first sanctuary configured with two adjoining suites, a full children bunk lounge, custom play alcove, kitchen pantry, and child-safe private garden patio.',
        amenities: [
          'Two Interconnected Bedrooms',
          'Full Kitchenette & Dining Table',
          'Child-Friendly Games & Books',
          'Enclosed Private Garden',
          'Two Luxury Bathrooms',
          'Baby Cot & High Chair Upon Request'
        ],
        images: [
          'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80'
        ],
        isActive: true
      },
      {
        roomNumber: '302',
        name: 'Sunset Horizon Deluxe Terrace',
        type: 'Deluxe',
        pricePerNight: 9500,
        capacity: 3,
        description:
          'Perched on the upper tier with west-facing terrace views. Features a plush King bed plus designer daybed, curated art collection, and complimentary twilight cocktails.',
        amenities: [
          'West-Facing Sunset Balcony',
          'King Bed + Daybed Lounger',
          'Marble Rainfall Shower',
          'Cocktail Bar & Shaker Set',
          'Smart Room Automation',
          'Priority Spa Booking'
        ],
        images: [
          'https://images.unsplash.com/photo-1507038772120-7eee76f79d74?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
        ],
        isActive: true
      }
    ]);

    console.log('[Seed] Creating sample active bookings and sandbox payments...');
    const checkInSample = new Date();
    checkInSample.setDate(checkInSample.getDate() + 5);
    const checkOutSample = new Date();
    checkOutSample.setDate(checkOutSample.getDate() + 8);
    const totalNights = 3;
    const totalAmount = totalNights * rooms[1].pricePerNight;

    const sampleBooking = await Booking.create({
      bookingId: 'HP-20261021-8842',
      user: customerUser._id,
      room: rooms[1]._id,
      guestName: customerUser.name,
      guestPhone: customerUser.phone,
      checkIn: checkInSample,
      checkOut: checkOutSample,
      totalNights,
      pricePerNight: rooms[1].pricePerNight,
      totalAmount,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentId: 'TXN-HP-SEED-001',
      specialRequests: 'High floor preferred and quiet courtyard view.'
    });

    await Payment.create({
      booking: sampleBooking._id,
      user: customerUser._id,
      amount: totalAmount,
      currency: 'INR',
      provider: 'HotelPro Payment Sandbox',
      transactionId: 'TXN-HP-SEED-001',
      paymentMethod: 'Sandbox Simulated Card',
      cardLast4: '4242',
      cardBrand: 'Visa',
      status: 'successful'
    });

    console.log('----------------------------------------------------');
    console.log(' HOTELPRO DATABASE SEEDED SUCCESSFULLY! ');
    console.log('----------------------------------------------------');
    console.log('Admin Account:');
    console.log('  Email:    admin@hotelpro.com');
    console.log('  Password: Admin@12345');
    console.log('Customer Account:');
    console.log('  Email:    customer@hotelpro.com');
    console.log('  Password: Customer@12345');
    console.log(`Seeded ${rooms.length} premium hotel rooms & 1 confirmed sample booking.`);
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
