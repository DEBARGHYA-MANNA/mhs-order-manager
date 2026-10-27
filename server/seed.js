const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin exists
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Admin already exists:', adminExists.username);
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: 'Admin',
            username: 'admin',
            password: 'admin123', // Change this!
            role: 'admin',
            shopName: 'MHS Medical Store',
        });

        console.log('✅ Admin user created successfully!');
        console.log(`   Username: ${admin.username}`);
        console.log(`   Password: admin123`);
        console.log('   ⚠️  Change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedAdmin();