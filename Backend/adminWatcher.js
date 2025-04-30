const chokidar = require('chokidar');
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
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

async function processCSVFile(filePath) {
    try {
        const results = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        for (const row of results) {
            const existingUser = await User.findOne({ "Email id": row["Email id"] });
            if (!existingUser) {
                const user = new User({
                    "Email id": row["Email id"],
                    "Password": row["Password"], // Store password as plain text
                    "Admins": row["Admins"] || "admin"
                });
                await user.save();
                console.log(`Created user: ${row["Email id"]}`);
            }
        }
    } catch (error) {
        console.error('Error processing CSV file:', error);
    }
}

chokidar.watch(filePath).on('change', () => {
  console.log('Admin users CSV changed... Updating MongoDB...');
  processCSVFile(filePath);
});

// Initial import
processCSVFile(filePath);

module.exports = { processCSVFile }; 