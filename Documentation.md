# Student Admission Tracker - Technical Documentation

## 1. Application Architecture
The application follows a three-tier architecture that consists of:

- Frontend (React): Single-page application handling UI/UX
- Backend (Node.js/Express): RESTful API server managing business logic
- MongoDB: NoSQL database storing user and student data
- Google OAuth: Handles secure authentication
- CSV File: Source for student data updates

[Note: Insert Architecture Diagram Here]

## 2. Core Components Breakdown

### Frontend Structure
```
Frontend/
├── src/
│   ├── assets/            # Static assets like images
│   ├── components/        # Reusable UI components
│   ├── config/           # Configuration files
│   ├── pages/            # Page components
│   ├── styles/           # CSS styles
│   └── utils/            # Utility functions
```

#### Key Frontend Files:

1. **config/config.js**
   - Manages environment-specific variables
   - Handles API endpoint configurations
   - Switches between development and production settings

```javascript
const config = {
    apiUrl: currentEnv.apiUrl,
    env: currentEnv.env,
    auth: {
        login: `${currentEnv.apiUrl}/auth/login`,
        google: `${currentEnv.apiUrl}/auth/google`
    }
};
```

2. **Components**
   - Header.jsx: Navigation and branding
   - Login.jsx: Authentication interface
   - MetricCard.jsx: Data visualization components
   - ProfileDropdown.jsx: User settings and logout

3. **Styles**
   - Modular CSS approach
   - Responsive design implementation
   - Theme variables and consistency

### Backend Structure
```
Backend/
├── config/              # Configuration files
├── models/             # MongoDB schemas
├── routes/             # API routes
├── middleware/         # Custom middleware
└── server.js          # Entry point
```

#### Key Backend Files:

1. **server.js**
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Middleware setup
app.use(cors());
app.use(express.json());

// Route handling
app.use('/auth', authRoutes);
app.use('/students', studentRoutes);
```

## 3. Data Flow

[Note: Insert Data Flow Diagram Here]

**Process Explanation:**
1. User initiates login
2. Frontend redirects to Google OAuth
3. OAuth returns authentication token
4. Backend validates and creates session
5. User accesses dashboard features

## 4. Key Features & Implementation

### Authentication Flow
```javascript
// Frontend authentication handling
const handleLogin = async () => {
    try {
        const response = await auth.googleLogin();
        if (response.success) {
            navigate('/dashboard');
        }
    } catch (error) {
        handleError(error);
    }
};
```

### Dashboard Metrics
- Real-time data updates using WebSocket
- Dynamic chart rendering
- Responsive metric cards

## 5. Styling Architecture

### CSS Organization
```css
/* Global variables */
:root {
    --primary-color: #1B0245;
    --accent-color: #0822b9;
    --success-color: #51FFA8;
}

/* Component-specific styles */
.metric-card {
    background-color: var(--card-bg);
    border-radius: var(--border-radius);
}
```

## 6. Security Measures

### Authentication Security
```javascript
// JWT implementation
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};
```

## 7. State Management

[Note: Insert State Management Diagram Here]

**State Flow:**
1. API data stored in React state
2. UI components subscribe to state changes
3. Local storage persists user session

## 8. API Structure

### Core Endpoints
```javascript
// Authentication routes
router.post('/auth/google', authController.googleAuth);
router.get('/auth/callback', authController.handleCallback);

// Student data routes
router.get('/students/metrics', studentController.getMetrics);
```

## 9. Performance Optimization

### Frontend Optimization
```javascript
// Code splitting example
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

// Implementation
<Suspense fallback={<Loading />}>
    <Dashboard />
</Suspense>
```

## 10. Development Workflow

[Note: Insert Development Workflow Diagram Here]

**Workflow Stages:**
1. Local development
2. Testing and validation
3. Production build
4. Deployment to hosting
5. Performance monitoring

## 11. Environment Configuration

### Configuration Management
```javascript
// Development settings
development: {
    apiUrl: 'http://localhost:5000',
    env: 'development',
    features: {
        debugMode: true,
        mockData: true
    }
}

// Production settings
production: {
    apiUrl: 'https://mycapstone-3.onrender.com',
    env: 'production',
    features: {
        debugMode: false,
        mockData: false
    }
}
``` 