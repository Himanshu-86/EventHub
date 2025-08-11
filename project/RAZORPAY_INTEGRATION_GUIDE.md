# Razorpay UPI Project Integration Guide

## Current EventHub Integration:

### 1. **Event Detail Page Changes:**
- ✅ Added **"Book via UPI Payment"** button
- ✅ Opens external payment window at `http://localhost:3000`
- ✅ Passes event data via URL parameters and localStorage

### 2. **Data Passed to External App:**
```javascript
const paymentData = {
  eventName: event.title,
  eventId: event.id,
  price: event.price,
  organizerName: event.organizername,
  eventDate: formattedDate,
  eventTime: event.time,
  location: event.location,
  userEmail: user?.email,
  userName: user?.name
};
```

### 3. **URL Format:**
```
http://localhost:3000?eventData=<encoded_json_data>
```

## Required Changes in Your Razorpay UPI Project:

### 1. **Read Event Data on Load:**
```javascript
// In your main page/component
useEffect(() => {
  // Method 1: From URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const eventDataParam = urlParams.get('eventData');
  
  if (eventDataParam) {
    const eventData = JSON.parse(decodeURIComponent(eventDataParam));
    setEventDetails(eventData);
  }
  
  // Method 2: From localStorage (backup)
  const storedData = localStorage.getItem('eventPaymentData');
  if (storedData && !eventDataParam) {
    const eventData = JSON.parse(storedData);
    setEventDetails(eventData);
  }
}, []);
```

### 2. **Display Event Information:**
```javascript
// Show event details in your payment form
<div className="event-info">
  <h3>Event: {eventData.eventName}</h3>
  <p>Date: {eventData.eventDate} at {eventData.eventTime}</p>
  <p>Location: {eventData.location}</p>
  <p>Price: ₹{eventData.price}</p>
  <p>Organizer: {eventData.organizerName}</p>
</div>
```

### 3. **Send Payment Success Message:**
```javascript
// After successful payment
const sendPaymentSuccess = (paymentResult) => {
  // Send message back to parent window (EventHub)
  if (window.opener) {
    window.opener.postMessage({
      type: 'PAYMENT_SUCCESS',
      paymentData: {
        eventId: eventData.eventId,
        amount: eventData.price,
        paymentId: paymentResult.razorpay_payment_id,
        paymentMethod: 'UPI'
      }
    }, 'http://localhost:5174'); // EventHub URL
    
    // Close payment window after success
    window.close();
  }
};

// After payment failure
const sendPaymentFailure = () => {
  if (window.opener) {
    window.opener.postMessage({
      type: 'PAYMENT_FAILED'
    }, 'http://localhost:5174');
    
    window.close();
  }
};
```

### 4. **Update Your Payment Handler:**
```javascript
const handlePaymentSuccess = (response) => {
  // Your existing payment success logic
  console.log('Payment successful:', response);
  
  // Send success message to EventHub
  sendPaymentSuccess(response);
};

const handlePaymentError = (error) => {
  // Your existing error handling
  console.error('Payment failed:', error);
  
  // Send failure message to EventHub
  sendPaymentFailure();
};
```

## Test Integration:

### 1. **Start Both Projects:**
```bash
# Terminal 1: EventHub (should already be running)
cd project
npm run dev
# Runs on: http://localhost:5174

# Terminal 2: Your Razorpay UPI Project
cd razorpay_upi_project
npm start (or your start command)
# Should run on: http://localhost:3000
```

### 2. **Test Flow:**
1. Open EventHub: `http://localhost:5174`
2. Click on any event card
3. Click "Book via UPI Payment" button
4. Your payment window should open with event details
5. Complete payment in your app
6. Window should close and show success message in EventHub

## Sample Integration Code for Your Project:

```javascript
// razorpay_upi_project/src/App.js (or main component)

import React, { useState, useEffect } from 'react';

function App() {
  const [eventData, setEventData] = useState(null);
  
  useEffect(() => {
    // Get event data from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const eventDataParam = urlParams.get('eventData');
    
    if (eventDataParam) {
      const data = JSON.parse(decodeURIComponent(eventDataParam));
      setEventData(data);
    }
  }, []);

  const handlePaymentSuccess = (response) => {
    // Your existing payment success logic
    
    // Send success message back to EventHub
    if (window.opener) {
      window.opener.postMessage({
        type: 'PAYMENT_SUCCESS',
        paymentData: {
          eventId: eventData.eventId,
          amount: eventData.price,
          paymentId: response.razorpay_payment_id,
          paymentMethod: 'UPI'
        }
      }, 'http://localhost:5174');
      
      setTimeout(() => window.close(), 1000);
    }
  };

  return (
    <div className="App">
      {eventData && (
        <div className="event-booking">
          <h2>Book Tickets for {eventData.eventName}</h2>
          <p>Price: ₹{eventData.price}</p>
          <p>Date: {eventData.eventDate}</p>
          {/* Your existing payment form */}
        </div>
      )}
    </div>
  );
}

export default App;
```

## Ready to Test! 🚀

Your EventHub project is now ready to integrate with your Razorpay UPI project. Just implement the above changes in your `razorpay_upi_project (2)` and both apps will work together seamlessly!
