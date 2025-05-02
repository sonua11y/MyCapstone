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

// Initialize lastModifiedTime
let lastModifiedTime = null;

// Get the CSV file path based on environment
const getFilePath = () => {
  return process.env.CSV_PATH || path.join(__dirname, 'data', 'mock-data.csv');
};

const filePath = getFilePath();

// Function to check if file exists
const ensureFileExists = () => {
  if (!fs.existsSync(filePath)) {
    console.log('CSV file not found at:', filePath);
    return false;
  }
  return true;
};

// Function to get last modified time
const getLastModifiedTime = () => {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return stats.mtime;
    }
  } catch (error) {
    console.error('Error getting file stats:', error);
  }
  return new Date();
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
    'Upload date': csvData["Upload date"] || "N/A",
    'Date of payment': csvData["Date of payment"] || "N/A",
    'Transaction id': transactionId,
    'First Name': csvData["First Name"] || "",
    'Last Name': csvData["Last Name"] || "",
    'College': csvData["College"] ? csvData["College"].trim() : "",
    '10K': csvData["10K"] || "No",
    'Sem Fee': csvData["Sem Fee"] || "No",
    'Gender': csvData["Gender"] || "",
    'Fees': csvData["Fees"] || "",
    'Year': csvData["Year"] || "2025",
    'Withdrawal': csvData["Withdrawal"] || ""
  };
};

// Function to update MongoDB with CSV data
const updateMongoDB = async () => {
  if (!ensureFileExists()) {
    return false;
  }

  try {
    console.log('Starting MongoDB update from CSV...');
    const students = [];
    
    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          const student = mapCSVToStudent(data);
          students.push(student);
        })
        .on('end', () => {
          console.log(`Processed ${students.length} rows with 0 errors`);
          resolve();
        })
        .on('error', (error) => {
          console.error('Error reading CSV:', error);
          reject(error);
        });
    });

    // Delete existing records
    console.log('Deleted existing records');
    await Student.deleteMany({});

    // Insert new records in batches
    const batchSize = 50;
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);
      await Student.insertMany(batch);
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(students.length/batchSize)}`);
    }

    // Update lastModifiedTime
    lastModifiedTime = getLastModifiedTime();
    console.log('Updated lastModifiedTime:', lastModifiedTime);
    console.log('Final document count in MongoDB:', await Student.countDocuments());
    
    return true;
  } catch (error) {
    console.error('Error updating MongoDB:', error);
    return false;
  }
};

// Function to check for file changes
const checkFileChange = async () => {
  if (!ensureFileExists()) {
    return false;
  }

  const currentModifiedTime = getLastModifiedTime();
  if (currentModifiedTime > lastModifiedTime) {
    console.log('File changed, updating MongoDB...');
    const success = await updateMongoDB();
    if (success) {
      console.log('MongoDB update successful');
    } else {
      console.log('MongoDB update failed');
    }
    return true;
  }
  return false;
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
  console.log('File watcher set up successfully');
} catch (error) {
  console.error('Error setting up file watcher:', error);
  console.log('File watching disabled');
}

// Export functions
module.exports = {
  getLastModifiedTime,
  checkFileChange,
  updateMongoDB
};
