// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const db = require('./config/db');

// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Serve images
// // app.use('/images', express.static('../kapato-store/src/assets/caps'));

// // Routes
// app.use('/api/products', require('./routes/products'));

// // Test Route
// app.get('/', (req, res) => {
//   res.send('KAPATO Backend is Running!');
// });

// // const PORT = process.env.PORT || 5000;

// // if (process.env.NODE_ENV !== "production") {
// //   app.listen(PORT, () => {
// //     console.log(`Server running on http://localhost:${PORT}`);
// //   });
// // }

// module.exports = app;











const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

console.log("Before DB");
const db = require('./config/db');
console.log("After DB");

dotenv.config();

const app = express();

console.log("Server Started");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/products'));

// Test Route
app.get('/', (req, res) => {
  res.send('KAPATO Backend is Running!');
});

module.exports = app;