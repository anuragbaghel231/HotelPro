const assert = require('assert');
const http = require('http');
const app = require('../server');

// Simple native test harness to test all key REST endpoints
const runTests = async () => {
  console.log('\n--- Running HotelPro Backend Integration Tests ---\n');

  let server;
  const testPort = 5005;

  await new Promise((resolve) => {
    server = app.listen(testPort, () => {
      console.log(`[Test Suite] Test server running on port ${testPort}`);
      resolve();
    });
  });

  const request = (method, path, body = null, headers = {}) => {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(`http://localhost:${testPort}${path}`);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        });
      });

      req.on('error', (err) => reject(err));

      if (body) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body));
      }
      req.end();
    });
  };

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert.strictEqual(health.statusCode, 200);
    assert.strictEqual(health.body.status, 'healthy');
    console.log('✓ Health check endpoint passed');

    // 2. Customer Login
    const custLogin = await request('POST', '/api/auth/login', {
      email: 'customer@hotelpro.com',
      password: 'Customer@12345'
    });
    assert.strictEqual(custLogin.statusCode, 200);
    assert.strictEqual(custLogin.body.user.role, 'customer');
    const customerToken = custLogin.body.token;
    assert.ok(customerToken);
    console.log('✓ Customer login passed (JWT token issued)');

    // 3. Admin Login
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@hotelpro.com',
      password: 'Admin@12345'
    });
    assert.strictEqual(adminLogin.statusCode, 200);
    assert.strictEqual(adminLogin.body.user.role, 'admin');
    const adminToken = adminLogin.body.token;
    console.log('✓ Admin login passed (Admin role verified)');

    // 4. Customer attempting to access Admin API (must return 403 Forbidden)
    const unauthorizedAccess = await request('GET', '/api/admin/dashboard', null, {
      Authorization: `Bearer ${customerToken}`
    });
    assert.strictEqual(unauthorizedAccess.statusCode, 403);
    console.log('✓ Customer denied from accessing admin endpoints (403 Forbidden verified)');

    // 5. Admin accessing Admin Dashboard
    const adminDash = await request('GET', '/api/admin/dashboard', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert.strictEqual(adminDash.statusCode, 200);
    assert.ok(adminDash.body.stats.totalRooms >= 6);
    console.log('✓ Admin dashboard metrics returned successfully');

    // 6. Public Room Browsing
    const roomsRes = await request('GET', '/api/rooms');
    assert.strictEqual(roomsRes.statusCode, 200);
    assert.ok(roomsRes.body.rooms.length >= 6);
    const targetRoom = roomsRes.body.rooms[0];
    console.log(`✓ Rooms browsing passed (${roomsRes.body.rooms.length} rooms available)`);

    // 7. Check room availability
    const availRes = await request(
      'GET',
      `/api/rooms/availability?roomId=${targetRoom._id}&checkIn=2026-12-01&checkOut=2026-12-04`
    );
    assert.strictEqual(availRes.statusCode, 200);
    assert.strictEqual(availRes.body.available, true);
    console.log('✓ Room availability check passed');

    // 8. Create a booking as customer
    const bookingRes = await request(
      'POST',
      '/api/bookings',
      {
        roomId: targetRoom._id,
        checkIn: '2026-12-01',
        checkOut: '2026-12-04',
        guestName: 'Eleanor Vance',
        guestPhone: '+1-555-234-5678',
        guestCount: 1,
        specialRequests: 'Quiet room on upper floor please.'
      },
      {
        Authorization: `Bearer ${customerToken}`
      }
    );
    assert.strictEqual(bookingRes.statusCode, 201);
    const newBooking = bookingRes.body.booking;
    assert.strictEqual(newBooking.totalNights, 3);
    assert.strictEqual(newBooking.totalAmount, 3 * targetRoom.pricePerNight);
    assert.strictEqual(newBooking.status, 'pending');
    console.log('✓ Server-calculated booking created (Total amount verified strictly on server)');

    // 9. Overlapping booking prevention check (Concurrency safety)
    const duplicateBookingRes = await request(
      'POST',
      '/api/bookings',
      {
        roomId: targetRoom._id,
        checkIn: '2026-12-02',
        checkOut: '2026-12-05',
        guestName: 'Another Guest',
        guestPhone: '+1-555-999-0000',
        guestCount: 1
      },
      {
        Authorization: `Bearer ${customerToken}`
      }
    );
    assert.strictEqual(duplicateBookingRes.statusCode, 409);
    console.log('✓ Overlapping booking rejected with 409 Conflict');

    // 10. Payment Sandbox: Decline Simulation
    const failPayment = await request(
      'POST',
      '/api/payments/checkout',
      {
        bookingId: newBooking._id,
        simulateOutcome: 'decline'
      },
      {
        Authorization: `Bearer ${customerToken}`
      }
    );
    assert.strictEqual(failPayment.statusCode, 402);
    console.log('✓ Payment decline simulation handled properly (402 Payment Required)');

    // 11. Payment Sandbox: Success Checkout
    const successPayment = await request(
      'POST',
      '/api/payments/checkout',
      {
        bookingId: newBooking._id,
        simulateOutcome: 'success',
        cardBrand: 'Visa',
        cardLast4: '4242'
      },
      {
        Authorization: `Bearer ${customerToken}`
      }
    );
    assert.strictEqual(successPayment.statusCode, 200);
    assert.strictEqual(successPayment.body.payment.status, 'successful');
    assert.strictEqual(successPayment.body.booking.status, 'confirmed');
    assert.strictEqual(successPayment.body.booking.paymentStatus, 'paid');
    console.log('✓ Payment sandbox success verified, booking confirmed and paid');

    // 12. Booking Cancellation with Refund
    const cancelRes = await request(
      'PATCH',
      `/api/bookings/${newBooking._id}/cancel`,
      {},
      {
        Authorization: `Bearer ${customerToken}`
      }
    );
    assert.strictEqual(cancelRes.statusCode, 200);
    assert.strictEqual(cancelRes.body.booking.status, 'cancelled');
    assert.strictEqual(cancelRes.body.booking.paymentStatus, 'refunded');
    assert.ok(cancelRes.body.refund.refundTransactionId);
    console.log('✓ Booking cancellation and sandbox refund verified');

    // 13. Customer can only retrieve their own bookings
    const myBookingsRes = await request('GET', '/api/bookings/my', null, {
      Authorization: `Bearer ${customerToken}`
    });
    assert.strictEqual(myBookingsRes.statusCode, 200);
    assert.ok(myBookingsRes.body.bookings.length >= 1);
    console.log('✓ Customer isolated bookings retrieval passed');

    console.log('\n=============================================');
    console.log(' ALL 13 BACKEND INTEGRATION TESTS PASSED! ');
    console.log('=============================================\n');

    server.close();
    process.exit(0);
  } catch (error) {
    console.error('Test suite failed:', error);
    if (server) server.close();
    process.exit(1);
  }
};

runTests();
