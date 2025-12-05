const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 1. IMPORT MODELS
const User = require('./models/User');
const Group = require('./models/Group');

// 2. IMPORT ROUTES
const authRoute = require('./routes/auth');
const expenseRoute = require('./routes/expenses');
const groupRoute = require('./routes/groups');
const notificationRoute = require('./routes/notifications'); 

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// 3. CONNECT ROUTES (Traffic Controllers)
app.use('/api/auth', authRoute);
app.use('/api/expenses', expenseRoute);
app.use('/api/groups', groupRoute);
app.use('/api/notifications', notificationRoute); 

// --- AUTO-PILOT: Creates Default Data if DB is Empty ---
const initialiseDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("⚙️ Database is empty. Creating default users...");
      
      const u1 = await new User({ name: "Arushi", email: "arushi@test.com", password: "123" }).save();
      const u2 = await new User({ name: "Rahul", email: "rahul@test.com", password: "123" }).save();
      const u3 = await new User({ name: "Sneha", email: "sneha@test.com", password: "123" }).save();

      await new Group({
        name: "Chemical Engineers",
        members: [u1._id, u2._id, u3._id]
      }).save();

      console.log("✅ Default Data Created!");
    } else {
      console.log("ℹ️ Database ready.");
    }
  } catch (err) {
    console.error("❌ Auto-Seed Failed:", err);
  }
};
// -------------------------------------------------------

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    initialiseDatabase();
  })
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// const express = require('express');
// const mongoose = require('mongoose');
// <<<<<<< HEAD
// =======
// const groupRoute = require('./routes/groups');
// const authRoute = require('./routes/auth');
// >>>>>>> 23a527acada4074fc25b7d897049e06ccbbb50fb
// const cors = require('cors');
// require('dotenv').config();

// // Import Models so we can auto-create data
// const User = require('./models/User');
// const Group = require('./models/Group');

// const app = express();

// // Middleware (Allows Frontend to talk to Backend)
// app.use(express.json());
// app.use(cors());

// // Routes
// app.use('/api/expenses', require('./routes/expenses'));
// <<<<<<< HEAD
// app.use('/api/groups', require('./routes/groups'));

// // --- AUTO-PILOT: Creates Data if Database is Empty ---
// const initialiseDatabase = async () => {
//   try {
//     const userCount = await User.countDocuments();
//     if (userCount === 0) {
//       console.log("⚙️ Database is empty. Creating default users...");

//       // 1. Create Users
//       const u1 = await new User({ name: "Arushi", email: "arushi@test.com", password: "123" }).save();
//       const u2 = await new User({ name: "Rahul", email: "rahul@test.com", password: "123" }).save();
//       const u3 = await new User({ name: "Sneha", email: "sneha@test.com", password: "123" }).save();

//       // 2. Create Group
//       await new Group({
//         name: "Chemical Engineers",
//         members: [u1._id, u2._id, u3._id]
//       }).save();

//       console.log("✅ Default Data Created! (Arushi, Rahul, Sneha)");
//     } else {
//       console.log("ℹ️ Database already has data. Ready to go!");
//     }
//   } catch (err) {
//     console.error("❌ Auto-Seed Failed:", err);
//   }
// };
// // ----------------------------------------------------
// =======
// app.use('/api/groups', groupRoute);
// app.use('/api/auth', authRoute);
// >>>>>>> 23a527acada4074fc25b7d897049e06ccbbb50fb

// // Database Connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("✅ MongoDB Connected Successfully");
//     // Run the Auto-Pilot immediately after connecting
//     initialiseDatabase();
//   })
//   .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// // Test Route
// app.get('/', (req, res) => {
//   res.send('API is Running...');
// });

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


// const express = require('express');
// const mongoose = require('mongoose');
// const groupRoute = require('./routes/groups');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());
// app.use('/api/expenses', require('./routes/expenses'));
// app.use('/api/groups', groupRoute);

// // Database Connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected Successfully"))
//   .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// // Test Route
// app.get('/', (req, res) => {
//   res.send('API is Running...');
// });

// // Start Server
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });