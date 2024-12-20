const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const PaisesRoutes = require('./routes/paisesController.js');
const CiudadesRoutes = require('./routes/ciudadesController.js');
const AccountRoutes = require('./routes/accountController.js');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const helper = require('./helper.js');
const path = require("path");

const corsOptions = {
  origin: [
    'http://18.117.196.27:80',
    'http://ec2-18-117-196-27.us-east-2.compute.amazonaws.com:80',
    'ec2-18-117-196-27.us-east-2.compute.amazonaws.com',
    'http://ec2-18-117-196-27.us-east-2.compute.amazonaws.com',
    'http://localhost:4200',
    'http://localhost:8080'
  ],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-XSRF-TOKEN'],
  credentials:true,
  optionsSuccessStatus: 200
};

//const csrfProtection = csrf({ cookie: true });
app.disable('x-powered-by');
app.use(cookieParser()); // Parse cookies
app.use(cors(corsOptions)); // Enable CORS
app.use(bodyParser.urlencoded({ extended: false })); // Parse URL-encoded data
app.use(bodyParser.json()); // Parse JSON data
app.use(express.static(path.join(__dirname, "files"))); // Serve static files
const csrfProtection = csrf({
  cookie: true,
  value: (req) => req.headers['xsrf-token'] || req.cookies['XSRF-TOKEN'], // Cambia el valor del encabezado si es necesario
});

app.use(csrfProtection);
// Cache and Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'max-age=604800'); // Cache for one week
  res.setHeader('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
  res.setHeader('X-Frame-Options', 'DENY'); // Prevent clickjacking
  res.setHeader('X-XSS-Protection', '1; mode=block'); // Enable XSS protection
  next();
});

// API Endpoint to Get CSRF Token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  try {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
      httpOnly: false,
      secure: false,  // Set true for HTTPS
      sameSite: 'Lax',
      domain: 'localhost', // Explicitly set the domain for the cookie
      path: '/',  // Set the path to ensure the cookie is accessible by all routes
    });

    const response = { message: 'CSRF token set in cookie' };
    return res.status(200).json({
      data: helper.encrypt(JSON.stringify(response))
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return res.status(500).json({ error: 'Failed to generate CSRF token' });
  }
});

// Routes with CSRF Protection
app.use('/Account', csrfProtection, AccountRoutes);
app.use('/Countries', csrfProtection, PaisesRoutes);
app.use('/Ciudades', csrfProtection, CiudadesRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.error('Invalid CSRF token:', err);
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  console.error('Unhandled error:', err.stack);
  return res.status(500).send('Internal Server Error');
});

// Start the Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  if(process.env.production){
    console.log = function(){}
    console.warn = function(){}
    console.error = function(){}
 }
});

// Import Additional Routes
require('./routes/tareasController.js');
