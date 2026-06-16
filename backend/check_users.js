const mongoose = require('mongoose');
const User = require('./src/models/User.js');

async function checkUsers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/capstone');
    console.log('Connected to MongoDB');
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
      console.log(`  Role: ${user.role}`);
      console.log(`  isOnline: ${user.isOnline}`);
      console.log(`  isBanned: ${user.isBanned}`);
      console.log(`  lastLogin: ${user.lastLogin}`);
      console.log(`  lastLogout: ${user.lastLogout}`);
      console.log(`  banReason: ${user.banReason || 'none'}`);
      console.log(`  bannedUntil: ${user.bannedUntil || 'none'}`);
      console.log('---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
