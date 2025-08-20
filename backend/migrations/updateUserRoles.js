const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const migrateUserRoles = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    // Find all users with isAdmin field
    const usersWithIsAdmin = await User.find({ isAdmin: { $exists: true } });
    console.log(`Found ${usersWithIsAdmin.length} users with isAdmin field`);

    // Update each user
    for (const user of usersWithIsAdmin) {
      const newRole = user.isAdmin === true ? 'super_admin' : 'user';
      
      await User.findByIdAndUpdate(user._id, {
        $set: { role: newRole },
        $unset: { isAdmin: 1 }
      });
      
      console.log(`Updated user ${user.email} from isAdmin: ${user.isAdmin} to role: ${newRole}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateUserRoles();
}

module.exports = { migrateUserRoles };
