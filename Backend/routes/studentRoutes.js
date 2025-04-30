const express = require('express');
const Student = require('../models/Student');
const { getLastModifiedTime } = require('../watcher');

const router = express.Router();

router.get('/last-updated', (req, res) => {
    const lastModified = getLastModifiedTime();
    if (!lastModified) {
        return res.status(404).json({ message: 'CSV not updated yet.' });
    }
    // Format the date to dd-mm-yyyy
    const date = new Date(lastModified);
    const formattedDate = date.toLocaleDateString('en-GB');
    res.json({ lastModified: formattedDate });
});

// GET all students
router.get('/all', async (req, res) => {
    try {
    const students = await Student.find({});
      res.json(students);
    } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// GET Admissions Data (Grouped by College)
router.get("/admissions", async (req, res) => {
    try {
        const students = await Student.aggregate([
            { 
                $match: { 
                    college: { $exists: true, $ne: null, $ne: "" } 
                } 
            },
            { 
                $group: { 
                    _id: "$college", 
                    count: { $sum: 1 } 
                } 
            },
            { 
                $sort: { count: -1 } 
            }
        ]);

        const result = students.map(item => ({
            College: item._id,
            count: item.count
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch admission data" });
    }
});

// GET 10K Fee Data
router.get('/tenk-fees', async (req, res) => {
    try {
        console.log("Attempting to fetch 10K fee data...");
        
        // Get all students with their exact fields from database
        const students = await Student.find({}).select('-__v -createdAt -updatedAt').lean();
        res.json(students);
    } catch (error) {
        console.error("Error fetching 10K student fee records:", error);
        res.status(500).json({ message: "Failed to fetch 10K student fee records", error: error.message });
    }
});

// GET Semester Fee Data
router.get("/sem-fee-paid", async (req, res) => {
    try {
        const paidColleges = await Student.aggregate([
            { 
                $match: { 
                    semFee: { $regex: /^yes$/i } 
                } 
            },
            { 
                $group: { 
                    _id: "$college", 
                    count: { $sum: 1 } 
                } 
            }
        ]);

        const result = paidColleges.map(item => ({
            college: item._id,
            fees: item.count
        }));

        res.json(result);
    } catch (error) {
        console.error("Error in sem fee paid:", error);
        res.status(500).json({ error: "Failed to fetch sem fee paid data" });
    }
});

// GET Girls Count Data
router.get("/girls", async (req, res) => {
    try {
        const girlsCount = await Student.aggregate([
            { 
                $match: { 
                    gender: { $regex: /^female$/i } 
                } 
            },
            { 
                $group: { 
                    _id: "$college", 
                    count: { $sum: 1 } 
                } 
            }
        ]);

        const result = {};
        girlsCount.forEach(item => {
            if (item._id) {
                result[item._id] = item.count;
            }
        });

        res.json(result);
    } catch (error) {
        console.error("Error in girls count:", error);
        res.status(500).json({ error: "Failed to fetch girls count" });
    }
});

// GET Withdrawal Data
router.get("/withdrawals", async (req, res) => {
    try {
        // Get all colleges first
        const allColleges = await Student.distinct("college");
        
        // Get colleges with withdrawals
        const withdrawalCounts = await Student.aggregate([
            { 
                $match: { 
                    withdrawal: { $regex: /^withdrawn$/i }
                } 
            },
            { 
                $group: { 
                    _id: "$college", 
                    count: { $sum: 1 } 
                } 
            }
        ]);

        // Create a map of college to withdrawal count
        const withdrawalMap = {};
        withdrawalCounts.forEach(item => {
            if (item._id) {
                withdrawalMap[item._id] = item.count;
            }
        });

        // Create result array with all colleges, using 0 for those without withdrawals
        const result = allColleges.map(college => ({
            college: college,
            count: withdrawalMap[college] || 0
        }));

        res.json(result);
    } catch (error) {
        console.error("Error in withdrawals:", error);
        res.status(500).json({ error: "Failed to fetch withdrawal data" });
    }
});

// GET Filling Status Data
router.get("/filling-status", async (req, res) => {
    try {
        const allColleges = await Student.distinct("college");
        const fastFillingColleges = allColleges.slice(0, Math.floor(allColleges.length * 0.4)); // 40% colleges as fast filling
        const slowFillingColleges = allColleges.slice(Math.floor(allColleges.length * 0.4));

        const result = [
            {
                type: "Fast Filling",
                count: fastFillingColleges.length,
                colleges: fastFillingColleges
            },
            {
                type: "Slow Filling",
                count: slowFillingColleges.length,
                colleges: slowFillingColleges
            }
        ];

        res.json(result);
    } catch (error) {
        console.error("Error in filling status:", error);
        res.status(500).json({ error: "Failed to fetch filling status" });
    }
});

// GET Previous Years Data
router.get('/previous-years', async (req, res) => {
    try {
        const universities = await Student.distinct("college");
        const counts2025 = await Promise.all(
            universities.map(university => 
                Student.countDocuments({ college: university, semFee: "Yes" })
            )
        );
        
        const result = universities.map((university, index) => ({
            university,
            '2023': 75,
            '2024': 84,
            '2025': counts2025[index]
        }));
        
        res.json(result);
    } catch (error) {
        console.error('Error fetching previous years data:', error);
        res.status(500).json({ error: 'Failed to fetch previous years data' });
    }
});

// AI-powered suggestions endpoint
router.post('/suggestions', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const searchRegex = new RegExp(query, 'i');

    // Get matches from all fields
    const matches = await Student.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { college: searchRegex },
        { transactionId: searchRegex }
      ]
    }).limit(10);

    // Extract and deduplicate suggestions
    const suggestions = new Set();
    matches.forEach(student => {
      // Check each field and add if it matches the search term
      if (searchRegex.test(student.firstName)) {
        suggestions.add(student.firstName);
      }
      if (searchRegex.test(student.lastName)) {
        suggestions.add(student.lastName);
      }
      if (searchRegex.test(student.college)) {
        suggestions.add(student.college.trim());
      }
      if (searchRegex.test(student.transactionId)) {
        suggestions.add(student.transactionId);
      }
    });

    res.json(Array.from(suggestions).slice(0, 5));
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
    }
});

// **POST - Add a New Student**
router.post('/', async (req, res) => {
    try {
        const newStudent = new Student(req.body);
        await newStudent.save();
        res.status(201).json({ message: 'Student added successfully', student: newStudent });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add student' });
    }
});

// **PUT - Update a Student by ID**
router.put('/:id', async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json({ message: 'Student updated successfully', student: updatedStudent });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update student' });
    }
});

// **DELETE - Remove a Student by ID**
router.delete('/:id', async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

// Get total number of students
router.get('/count', async (req, res) => {
  try {
    const count = await Student.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching total students:", error);
    res.status(500).json({ error: "Error fetching total students" });
  }
});

// Get students by college
router.get('/college/:college', async (req, res) => {
  try {
    const { college } = req.params;
    const students = await Student.find({ college: new RegExp(college, 'i') });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students by college:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Search students
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const students = await Student.find({
      $or: [
        { firstName: new RegExp(query, 'i') },
        { lastName: new RegExp(query, 'i') },
        { transactionId: new RegExp(query, 'i') },
        { college: new RegExp(query, 'i') }
      ]
    });
    res.json(students);
  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({ error: 'Failed to search students' });
  }
});

const getFastAndSlowFillingColleges = async () => {
  try {
    // Get the last 7 days' date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    console.log('Checking uploads between:', {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });

    // First, get all distinct colleges
    const allColleges = await Student.distinct('college');
    
    // Get all colleges with their upload counts in the last 7 days
    const collegesWithUploads = await Student.aggregate([
      {
        $match: {
          uploadDate: {
            $exists: true,
            $ne: null,
            $ne: ""
          }
        }
      },
      {
        $addFields: {
          // Convert dd-mm-yyyy to Date object for comparison
          parsedDate: {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $substr: ["$uploadDate", 6, 4] }, // year
                  "-",
                  { $substr: ["$uploadDate", 3, 2] }, // month
                  "-",
                  { $substr: ["$uploadDate", 0, 2] }  // day
                ]
              },
              format: "%Y-%m-%d"
            }
          }
        }
      },
      {
        $match: {
          parsedDate: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: { $trim: { input: "$college" } }, // Trim whitespace from college names
          uploadCount: { $sum: 1 }
        }
      },
      {
        $sort: { uploadCount: -1 }
      }
    ]);

    console.log('Colleges with uploads in last 7 days:', 
      collegesWithUploads.map(c => ({ 
        college: c._id, 
        uploads: c.uploadCount 
      }))
    );

    // If no colleges have uploads in the last 7 days
    if (collegesWithUploads.length === 0) {
      const result = {
        fastFillingColleges: [],
        slowFillingColleges: allColleges.map(college => college.trim())
      };
      console.log('No recent uploads, all colleges marked as slow filling:', result);
      return result;
    }

    // Any college with uploads in the last 7 days is considered fast filling
    const fastFillingColleges = collegesWithUploads.map(college => college._id);
    
    // Colleges with no uploads in the last 7 days are slow filling
    const slowFillingColleges = allColleges
      .map(college => college.trim())
      .filter(college => !fastFillingColleges.includes(college));

    const result = { fastFillingColleges, slowFillingColleges };
    console.log('Final categorization:', result);
    return result;
  } catch (error) {
    console.error('Error getting fast and slow filling colleges:', error);
    throw error;
  }
};

// Update the route to use the new function
router.get('/fast-slow-filling-colleges', async (req, res) => {
  try {
    const { fastFillingColleges, slowFillingColleges } = await getFastAndSlowFillingColleges();
    res.json({ fastFillingColleges, slowFillingColleges });
  } catch (error) {
    res.status(500).json({ error: 'Error getting fast and slow filling colleges' });
  }
});

module.exports = router;
