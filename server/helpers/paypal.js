const paypal = require('paypal-rest-sdk');

paypal.configure({
  mode: 'sandbox', // Change this to 'live' for production
  client_id: 'YOUR_CLIENT_ID',
  client_secret: 'YOUR_CLIENT_SECRET'
});
