// const User = require('../models/User');
// const generateToken = require('../utils/generateToken');
// const AppError = require('../utils/appError');
// const { OAuth2Client } = require('google-auth-library');

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // ================= REGISTER (WITH ROLE) =================
// exports.register = async (req, res, next) => {
//   try {
//     const { name, email, password, phone, role } = req.body;

//     if (!name || !email || !password)
//       return next(new AppError('All fields required', 400));

//     // Validate role
//     const validRoles = ['HOUSEHOLD', 'NGO', 'RECYCLER'];
//     const userRole = role && validRoles.includes(role.toUpperCase()) 
//       ? role.toUpperCase() 
//       : 'HOUSEHOLD';

//     const exists = await User.findOne({ email });
//     if (exists) return next(new AppError('Email already exists', 400));

//     const user = await User.create({
//       name,
//       email,
//       password,
//       phone,
//       role: userRole,
//       locality: 'Not Set',
//       address: 'Not Set',
//       authProvider: 'local',
//       profileCompleted: false
//     });

// const token = generateToken(user._id, user.role, user.locality);

//     res.status(201).json({
//       success: true,
//       data: { 
//         user: {
//           ...user.toObject(),
//           isProfileComplete: user.isProfileComplete
//         }, 
//         token 
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // ================= LOGIN =================
// exports.login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email }).select('+password');
//     if (!user) return next(new AppError('Invalid credentials', 401));

//     if (user.authProvider === 'google')
//       return next(new AppError('Use Google Sign-In', 401));

//     const ok = await user.comparePassword(password);
//     if (!ok) return next(new AppError('Invalid credentials', 401));

//     const token = generateToken(user._id, user.role, user.locality);

//     res.json({ 
//       success: true, 
//       data: { 
//         user: {
//           ...user.toObject(),
//           isProfileComplete: user.isProfileComplete
//         }, 
//         token 
//       } 
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // ================= GOOGLE AUTH (WITH ROLE) =================
// exports.googleAuth = async (req, res, next) => {
//   try {
//     const { credential, role } = req.body;

//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const { email, name, picture, sub } = ticket.getPayload();

//     let user = await User.findOne({ email });

//     if (!user) {
//       // Validate role for new users
//       const validRoles = ['HOUSEHOLD', 'NGO', 'RECYCLER'];
//       const userRole = role && validRoles.includes(role.toUpperCase()) 
//         ? role.toUpperCase() 
//         : 'HOUSEHOLD';

//       user = await User.create({
//         name,
//         email,
//         googleId: sub,
//         profilePicture: picture,
//         role: userRole,
//         locality: 'Not Set',
//         address: 'Not Set',
//         authProvider: 'google',
//         profileCompleted: false
//       });
//     }

//     const token = generateToken(user._id, user.role, user.locality);

//     res.json({
//       success: true,
//       data: {
//         user: {
//           ...user.toObject(),
//           isProfileComplete: user.isProfileComplete
//         },
//         token,
//         needsProfileCompletion: !user.isProfileComplete,
//       },
//     });
//   } catch (err) {
//     next(new AppError('Google auth failed', 401));
//   }
// };

// // ================= GET ME =================
// exports.getMe = async (req, res) => {
//   const user = await User.findById(req.user.id);
//   res.json({ 
//     success: true, 
//     data: { 
//       user: {
//         ...user.toObject(),
//         isProfileComplete: user.isProfileComplete
//       }
//     } 
//   });
// };

// // ================= UPDATE PROFILE =================
// exports.updateProfile = async (req, res, next) => {
//   try {
//     const { phone, locality, address, latitude, longitude } = req.body;

//     const user = await User.findById(req.user.id);
//     if (!user) return next(new AppError('User not found', 404));

//     // Update basic fields
//     if (phone !== undefined) user.phone = phone;
//     if (locality !== undefined && locality.trim()) user.locality = locality.trim();
//     if (address !== undefined && address.trim()) user.address = address.trim();
    
//     // Update location coordinates
//     const lat = parseFloat(latitude);
//     const lng = parseFloat(longitude);
    
//     if (!isNaN(lat) && !isNaN(lng)) {
//       user.location = {
//         latitude: lat,
//         longitude: lng
//       };
//     }

//     // Check if profile is now complete
//     if (user.role === 'NGO') {
//   user.profileCompleted =
//     user.locality?.trim() &&
//     user.address?.trim() &&
//     user.location &&
//     typeof user.location.latitude === 'number' &&
//     typeof user.location.longitude === 'number';
// }
// else {
//       // HOUSEHOLD needs at least locality and address
//       user.profileCompleted = 
//         user.locality && user.locality !== 'Not Set' &&
//         user.address && user.address !== 'Not Set';
//     }

//     await user.save();

//     res.json({
//       success: true,
//       message: 'Profile updated successfully',
//       data: { 
//         user: {
//           ...user.toObject(),
//           isProfileComplete: user.isProfileComplete
//         }
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };


const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/appError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ================= REGISTER (ALL ROLES: HOUSEHOLD, NGO, RECYCLER) =================
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm, phone, role } = req.body;

    // Validation
    if (!name || !email || !password || !passwordConfirm) {
      return next(new AppError('All fields required', 400));
    }

    if (password !== passwordConfirm) {
      return next(new AppError('Passwords do not match', 400));
    }

    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    // Validate and set role
    const validRoles = ['HOUSEHOLD', 'NGO', 'RECYCLER'];
    const userRole = role && validRoles.includes(role.toUpperCase()) 
      ? role.toUpperCase() 
      : 'HOUSEHOLD';

    // Check if user exists
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return next(new AppError('Email already registered', 409));
    }

    // Create user with role-specific defaults
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: userRole,
      address: 'Not Set',
      authProvider: 'local',
      profileCompleted: false
    };

    // Role-specific locality handling
    if (userRole === 'RECYCLER') {
      userData.locality = 'Not Required'; // Recyclers don't need locality
    } else {
      userData.locality = 'Not Set'; // HOUSEHOLD and NGO need locality
    }

    const user = await User.create(userData);

    const token = generateToken(user._id, user.role, user.locality);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { 
        user: {
          ...user.toObject(),
          isProfileComplete: user.isProfileComplete
        }, 
        token 
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================= LOGIN (ALL ROLES) =================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    if (user.authProvider === 'google') {
      return next(new AppError('Use Google Sign-In', 401));
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new AppError('Invalid credentials', 401));
    }

    const token = generateToken(user._id, user.role, user.locality);

    console.log(`✅ ${user.role} login successful: ${user.email}`);

    res.json({ 
      success: true,
      message: 'Login successful',
      data: { 
        user: {
          ...user.toObject(),
          isProfileComplete: user.isProfileComplete
        }, 
        token 
      } 
    });
  } catch (err) {
    next(err);
  }
};

// ================= GOOGLE AUTH (ALL ROLES) =================
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential, role } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      const validRoles = ['HOUSEHOLD', 'NGO', 'RECYCLER'];
      const userRole = role && validRoles.includes(role.toUpperCase()) 
        ? role.toUpperCase() 
        : 'HOUSEHOLD';

      const userData = {
        name,
        email,
        googleId: sub,
        profilePicture: picture,
        role: userRole,
        address: 'Not Set',
        authProvider: 'google',
        profileCompleted: false
      };

      // Role-specific locality handling
      if (userRole === 'RECYCLER') {
        userData.locality = 'Not Required';
      } else {
        userData.locality = 'Not Set';
      }

      user = await User.create(userData);
    }

    const token = generateToken(user._id, user.role, user.locality);

    res.json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          isProfileComplete: user.isProfileComplete
        },
        token,
        needsProfileCompletion: !user.isProfileComplete,
      },
    });
  } catch (err) {
    next(new AppError('Google auth failed', 401));
  }
};

// ================= GET ME (ALL ROLES) =================
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({ 
    success: true, 
    data: { 
      user: {
        ...user.toObject(),
        isProfileComplete: user.isProfileComplete
      }
    } 
  });
};

// ================= UPDATE PROFILE (ALL ROLES) =================
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, locality, address, latitude, longitude, bio } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    // Update basic fields
    if (name !== undefined && name !== '') user.name = name;
    if (phone !== undefined && phone !== '') user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    
    // Locality & Address (not required for RECYCLER)
    if (user.role !== 'RECYCLER') {
      if (locality !== undefined && locality.trim()) user.locality = locality.trim();
      if (address !== undefined && address.trim()) user.address = address.trim();
    } else {
      // For recyclers, allow address but not locality
      if (address !== undefined && address.trim()) user.address = address.trim();
    }
    
    // Update location coordinates
    if (latitude !== undefined && latitude !== '' && latitude !== 'NaN' && 
        longitude !== undefined && longitude !== '' && longitude !== 'NaN') {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        user.latitude = lat;
        user.longitude = lng;
        user.location = {
          latitude: lat,
          longitude: lng
        };
      }
    }

    // Handle profile image upload
    if (req.file) {
      try {
        if (user.profilePicture) {
          await deleteFromCloudinary(user.profilePicture);
        }
        const uploadResult = await uploadToCloudinary(req.file, 'user-profiles');
        user.profilePicture = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return next(new AppError('Failed to upload image', 500));
      }
    }

    // Check if profile is complete (role-specific)
    if (user.role === 'NGO') {
      user.profileCompleted =
        user.locality?.trim() &&
        user.address?.trim() &&
        user.location &&
        typeof user.location.latitude === 'number' &&
        typeof user.location.longitude === 'number';
    } else if (user.role === 'RECYCLER') {
      // Recycler only needs location
      user.profileCompleted = 
        user.location &&
        typeof user.location.latitude === 'number' &&
        typeof user.location.longitude === 'number';
    } else {
      // HOUSEHOLD needs locality and address
      user.profileCompleted = 
        user.locality && user.locality !== 'Not Set' &&
        user.address && user.address !== 'Not Set';
    }

    await user.save();

    console.log(`✅ Profile updated for ${user.role}: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { 
        user: {
          ...user.toObject(),
          isProfileComplete: user.isProfileComplete
        }
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================= CHANGE PASSWORD (ALL ROLES) =================
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new AppError('Please provide all password fields', 400));
    }

    if (newPassword !== confirmPassword) {
      return next(new AppError('New passwords do not match', 400));
    }

    if (newPassword.length < 6) {
      return next(new AppError('New password must be at least 6 characters', 400));
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }

    user.password = newPassword;
    await user.save();

    console.log(`✅ Password changed for ${user.role}: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ================= LOGOUT (ALL ROLES) =================
exports.logout = async (req, res, next) => {
  try {
    console.log(`✅ Logout: ${req.user.email || 'Unknown'}`);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};