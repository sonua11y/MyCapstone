const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Student = require('./models/Student');

// Skip watcher in production
if (process.env.NODE_ENV === 'production') {
  console.log('CSV Watcher is disabled in production mode');
  const filePath = process.env.CSV_PATH || path.join(__dirname, 'data', 'mock-data.csv');
  console.log('Production CSV path:', filePath);
  
  // Initialize lastModifiedTime
  let lastModifiedTime = null;
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      lastModifiedTime = stats.mtime;
      console.log('Initial CSV last modified time:', lastModifiedTime);
    } else {
      console.log('CSV file not found in production. Using current time.');
      lastModifiedTime = new Date();
    }
  } catch (err) {
    console.error('Error checking file in production:', err);
    lastModifiedTime = new Date();
  }

  module.exports = {
    getLastModifiedTime: () => {
      try {
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          return stats.mtime;
        }
        return lastModifiedTime;
      } catch (err) {
        console.error('Error getting file stats in production:', err);
        return lastModifiedTime;
      }
    }
  };
  return;
}

// Use the CSV file path from environment variable
const filePath = process.env.CSV_PATH || 'C:\\Users\\sripr\\Downloads\\My Mock Data.csv';
console.log('Using CSV file path:', filePath);

// Initialize lastModifiedTime
let lastModifiedTime = null;

// Function to check if file exists
const ensureFileExists = () => {
  if (!fs.existsSync(filePath)) {
    console.error('CSV file not found at:', filePath);
    return false;
  }
  return true;
};

// Function to map CSV data to MongoDB schema
const mapCSVToStudent = (csvData) => {
  // Handle Transaction ID - ensure it's a valid string
  let transactionId = csvData["Transaction id"] ? String(csvData["Transaction id"]).trim() : "";
  
  // If Transaction ID is empty or invalid, generate a unique one
  if (!transactionId) {
    transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  return {
    uploadDate: csvData["Upload date"] || "N/A",
    dateOfPayment: csvData["Date of payment"] || "N/A",
    transactionId: transactionId,
    firstName: csvData["First Name"] || "",
    lastName: csvData["Last Name"] || "",
    college: csvData["College"] ? csvData["College"].trim() : "",
    feePaid: csvData["10K"] || "No",
    semFee: csvData["Sem Fee"] || "No",
    gender: csvData["Gender"] || "",
    fees: csvData["Fees"] || "",
    year: csvData["Year"] || "2025",
    withdrawal: csvData["Withdrawal"] || ""
  };
};

// Function to update MongoDB from CSV
const updateMongoDB = async () => {
  try {
    console.log('Starting MongoDB update from CSV...');
    const students = [];
    let rowCount = 0;
    let errorCount = 0;
    
    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          rowCount++;
          try {
            const student = mapCSVToStudent(data);
            students.push(student);
          } catch (error) {
            errorCount++;
            console.error(`Error processing row ${rowCount}`);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Processed ${rowCount} rows with ${errorCount} errors`);

    if (students.length === 0) {
      console.error('No valid students to insert');
      return false;
    }

    // Wait for MongoDB connection to be ready
    while (mongoose.connection.readyState !== 1) {
      console.log('Waiting for MongoDB connection...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Delete existing records
    await Student.deleteMany({});
    console.log('Deleted existing records');

    // Insert new records in batches
    const batchSize = 50;
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, Math.min(i + batchSize, students.length));
      try {
        await Student.insertMany(batch, { 
          ordered: false,
          timeout: 30000
        });
        console.log(`Inserted batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(students.length/batchSize)}`);
      } catch (error) {
        if (error.writeErrors) {
          console.error(`Batch ${Math.floor(i/batchSize) + 1} had ${error.writeErrors.length} write errors`);
        } else {
          console.error(`Error in batch ${Math.floor(i/batchSize) + 1}:`, error);
        }
      }
    }

    // Update lastModifiedTime
    const stats = fs.statSync(filePath);
    lastModifiedTime = stats.mtime;
    console.log('Updated lastModifiedTime:', lastModifiedTime);

    const finalCount = await Student.countDocuments();
    console.log(`Final document count in MongoDB: ${finalCount}`);

    return true;
  } catch (error) {
    console.error('Error updating MongoDB:', error);
    return false;
  }
};

// Function to check if file has changed
const checkFileChange = async () => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log('CSV file not found:', filePath);
      return false;
    }

    const stats = fs.statSync(filePath);
    if (!lastModifiedTime || stats.mtime > lastModifiedTime) {
      console.log('File has changed, updating MongoDB...');
      return await updateMongoDB();
    }
    return false;
  } catch (error) {
    console.error('Error checking file change:', error);
    return false;
  }
};

// Initial update
if (ensureFileExists()) {
  const stats = fs.statSync(filePath);
  lastModifiedTime = stats.mtime;
  console.log('Initial lastModifiedTime:', lastModifiedTime);
  updateMongoDB().then(success => {
    if (success) {
      console.log('Initial MongoDB update successful');
    } else {
      console.log('Initial MongoDB update failed');
    }
  });
} else {
  console.log('CSV file not found on startup:', filePath);
  console.log('Please add your CSV file to:', filePath);
}

// Set up file watching
console.log('Setting up file watcher...');
try {
  fs.watch(filePath, async (eventType) => {
    if (eventType === 'change') {
      console.log('File changed, checking for updates...');
      await checkFileChange();
    }
  });
} catch (error) {
  console.error('Error setting up file watcher:', error);
  console.log('Please make sure the CSV file exists at:', filePath);
}

// Export functions
module.exports = {
  getLastModifiedTime: () => lastModifiedTime,
  checkFileChange,
  updateMongoDB
};
