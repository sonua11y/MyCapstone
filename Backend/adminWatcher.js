const chokidar = require('chokidar');
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// MongoDB Connection
mongoose.connect('mongodb+srv://sripranathiindupalli:studentfeetracker@capi.eqhj3yr.mongodb.net/StudentData?retryWrites=true&w=majority&appName=Capi')
  .then(() => {
    console.log('MongoDB Connected');
    console.log('Using DB:', mongoose.connection.db.databaseName);
  })
  .catch(err => console.log(err));

const filePath = process.env.ADMIN_CSV_PATH || 'C:/Users/sripr/Downloads/Admin Users.csv';
console.log('Watching for changes in:', filePath);

const importCSV = async () => {
  const admins = [];
  let rowCount = 0;

  try {
    // Read and process CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .on('error', (err) => {
          if (err.code === 'EBUSY') {
            console.log('File is busy... retrying in 1s');
            setTimeout(importCSV, 1000);
            reject(err);
          } else {
            console.error('File read error:', err);
            reject(err);
          }
        })
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;
          console.log(`Processing row ${rowCount}:`, row);
          admins.push({
            email: row.email?.trim().toLowerCase(),
            password: row.password?.trim(),
            role: 'admin'
          });
        })
        .on('end', resolve);
    });

    console.log(`Found ${admins.length} admin users in CSV`);

    // Hash passwords and update/insert users
    for (const admin of admins) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(admin.password, salt);

      await User.findOneAndUpdate(
        { email: admin.email },
        { 
          email: admin.email,
          password: hashedPassword,
          role: 'admin'
        },
        { upsert: true, new: true }
      );
    }

    // Delete any admin users not in the CSV
    const adminEmails = admins.map(a => a.email);
    await User.deleteMany({
      role: 'admin',
      email: { $nin: adminEmails }
    });

    const count = await User.countDocuments({ role: 'admin' });
    console.log(`Total admin users in MongoDB: ${count}`);
    console.log('Admin users updated successfully!');

  } catch (error) {
    console.error('Error updating admin users:', error);
  }
};

chokidar.watch(filePath).on('change', () => {
  console.log('Admin users CSV changed... Updating MongoDB...');
  importCSV();
});

// Initial import
importCSV(); 