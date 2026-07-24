const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT signed token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

// @desc    Register a new user (Student / Faculty)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role, department } = req.body;

    // 1. Basic field checks
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.',
      });
    }

    // 2. Strict college domain signature check (@sbjit.edu.in)
    const collegeDomainRegex = /^[a-zA-Z0-9._%+-]+@sbjit\.edu\.in$/;
    if (!collegeDomainRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message:
          'Registration restricted. You must use an official college email address ending with @sbjit.edu.in',
      });
    }

    // 3. Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // 4. Validate department requirement for Student / Faculty
    const userRole = role || 'Student';
    if ((userRole === 'Student' || userRole === 'Faculty') && !department) {
      return res.status(400).json({
        success: false,
        message: 'Department is required for Student and Faculty registration.',
      });
    }

    // 5. Create new user record (Password hashing handled in Mongoose pre-save hook)
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role: userRole,
      department: department || null,
    });

    // 6. Respond with token and user object
    if (user) {
      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'Registration successful.',
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          department: user.department,
          token,
        },
      });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check for required input fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // 2. Query user record (explicitly select password field since it is set to select: false in schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    // 3. Verify user existence and bcrypt password comparison
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    // 4. Issue JWT token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        token,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login authentication.',
    });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private (Protected)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'department',
      'deptCode deptName'
    );

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};