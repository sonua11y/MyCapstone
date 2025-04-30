const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Student = require('./models/Student');

// Set CSV path consistently
const filePath = 'C:/Users/sripr/Downloads/My Mock Data.csv';
console.log('Watching for changes in:', filePath);

// Last modified time tracker
let lastModifiedTime = null;

// Check initial file modification time
try {
    const stats = fs.statSync(filePath);
    lastModifiedTime = stats.mtime;
    console.log('Initial CSV last modified time:', lastModifiedTime);
} catch (err) {
    console.error('Error getting initial file stats:', err);
}

// MongoDB Connection
mongoose.connect('mongodb+srv://sripranathiindupalli:studentfeetracker@capi.eqhj3yr.mongodb.net/StudentData?retryWrites=true&w=majority&appName=Capi')
  .then(() => {
    console.log('MongoDB Connected');
    console.log('Using DB:', mongoose.connection.db.databaseName);
  })
  .catch(err => console.log(err));

const importCSV = () => {
  const students = [];
  let rowCount = 0;
  let validCount = 0;
  let invalidCount = 0;

  fs.createReadStream(filePath)
    .on('error', (err) => {
      if (err.code === 'EBUSY') {
        console.log('File is busy... retrying in 1s');
        setTimeout(importCSV, 1000);
      } else {
        console.error('File read error:', err);
      }
    })
    .pipe(csv())
    .on('headers', (headers) => {
      console.log('CSV Headers:', headers);
    })
    .on('data', (row) => {
      rowCount++;
      console.log(`\nProcessing row ${rowCount}:`);
      console.log('Raw data:', row);

      try {
        const student = {
          uploadDate: row["Upload date"] || "N/A",
          dateOfPayment: row["Date of payment"] || "N/A",
          transactionId: row["Transaction id"] || "",
          firstName: row["First Name"] || "",
          lastName: row["Last Name"] || "",
          college: row["College"] || "",
          feePaid: row["10K"] || "No",
          semFee: row["Sem Fee"] || "No",
          gender: row["Gender"] || "",
          fees: (() => {
            const feesValue = row["Fees"] || "";
            if (feesValue.toLowerCase().includes("not paid") || feesValue.trim() === "") {
              return 0;
            }
            try {
              return parseInt(feesValue.replace(/,/g, "")) || 0;
            } catch (e) {
              return 0;
            }
          })(),
          year: (() => {
            const yearValue = row["Year"] || "";
            try {
              return parseInt(yearValue) || 2025;
            } catch (e) {
              return 2025;
            }
          })(),
          withdrawal: row["Withdrawal"] || ""
        };

        const studentModel = new Student(student);
        const validationError = studentModel.validateSync();
        if (validationError) {
          invalidCount++;
          console.error(`Validation error in row ${rowCount}:`, validationError);
          console.error('Invalid student object:', student);
          return;
        }

        students.push(student);
        validCount++;
        console.log(`Successfully processed row ${rowCount}`);
      } catch (error) {
        invalidCount++;
        console.error(`Error processing row ${rowCount}:`, error);
      }
    })
    .on('end', async () => {
      console.log('\nProcessing Summary:');
      console.log(`Total rows in CSV: ${rowCount}`);
      console.log(`Valid records: ${validCount}`);
      console.log(`Invalid records: ${invalidCount}`);
      console.log(`Total processed: ${validCount + invalidCount}`);

      try {
        const deleteResult = await Student.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} existing records`);

        const batchSize = 50;
        for (let i = 0; i < students.length; i += batchSize) {
          const batch = students.slice(i, i + batchSize);
          try {
            const insertResult = await Student.insertMany(batch, { ordered: false });
            console.log(`Inserted batch ${i / batchSize + 1}: ${insertResult.length} records`);
          } catch (error) {
            console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
            if (error.writeErrors) {
              console.error('Write errors:', error.writeErrors);
            }
          }
        }

        const count = await Student.countDocuments();
        console.log(`Total records in MongoDB after update: ${count}`);

        const sample = await Student.findOne({});
        console.log('Sample inserted document:', sample);

        console.log('CSV Data Imported & MongoDB Updated Successfully!');
      } catch (error) {
        console.error('Error updating MongoDB:', error);
        if (error.writeErrors) {
          console.error('Write errors:', error.writeErrors);
        }
      }
    });
};

// Robust watcher using chokidar (polling = Excel friendly)
chokidar.watch(filePath, { usePolling: true, interval: 1000 }).on('change', async (changedPath) => {
  console.log(`CSV file changed at: ${changedPath} -> Updating MongoDB...`);
  try {
    const stats = await fs.promises.stat(filePath);
    lastModifiedTime = stats.mtime;
  } catch (err) {
    console.error('Error getting file stats:', err);
  }

  importCSV();
});

module.exports = {
  getLastModifiedTime: () => lastModifiedTime
};
