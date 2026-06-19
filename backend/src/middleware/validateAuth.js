function validateSignup(req, res, next) {
  const errors = [];
  const { firstName, lastName, email, phone, password } = req.body;

  if (!firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }
  if (!lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }
  if (!password || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }
  if (phone && typeof phone !== 'string') {
    errors.push({ field: 'phone', message: 'Phone must be a string' });
  }

  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  req.validatedBody = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    phone: phone?.trim() || null,
    password,
  };
  next();
}

function validateSignin(req, res, next) {
  const errors = [];
  const { email, password } = req.body;

  if (!email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  }
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  req.validatedBody = { email: email.trim(), password };
  next();
}

function validateProfileUpdate(req, res, next) {
  const errors = [];
  const data = {};
  const { firstName, lastName, phone } = req.body;

  if (firstName !== undefined) {
    if (!firstName?.trim()) {
      errors.push({ field: 'firstName', message: 'First name cannot be empty' });
    } else {
      data.firstName = firstName.trim();
    }
  }
  if (lastName !== undefined) {
    if (!lastName?.trim()) {
      errors.push({ field: 'lastName', message: 'Last name cannot be empty' });
    } else {
      data.lastName = lastName.trim();
    }
  }
  if (phone !== undefined) {
    data.phone = phone?.trim() || null;
  }

  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  req.validatedBody = data;
  next();
}

function validateChangePassword(req, res, next) {
  const errors = [];
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }
  if (!newPassword || newPassword.length < 6) {
    errors.push({ field: 'newPassword', message: 'New password must be at least 6 characters' });
  }

  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  req.validatedBody = { currentPassword, newPassword };
  next();
}

function validateAdminLogin(req, res, next) {
  const errors = [];
  const { username, password } = req.body;

  if (!username?.trim()) {
    errors.push({ field: 'username', message: 'Username is required' });
  }
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  req.validatedBody = { username: username.trim(), password };
  next();
}

function validateAdminCredentials(req, res, next) {
  const errors = [];
  const { currentPassword, newUsername, newPassword } = req.body;

  if (!currentPassword) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }
  if (newPassword && newPassword.length < 6) {
    errors.push({ field: 'newPassword', message: 'New password must be at least 6 characters' });
  }
  if (!newUsername?.trim() && !newPassword) {
    errors.push({ field: 'newUsername', message: 'Provide a new username or new password' });
  }

  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  req.validatedBody = {
    currentPassword,
    newUsername: newUsername?.trim() || undefined,
    newPassword: newPassword || undefined,
  };
  next();
}

function validateUserIdParam(req, res, next) {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id) || id < 1) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }
  req.userId = id;
  next();
}

function validateDeleteAccount(req, res, next) {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: [{ field: 'password', message: 'Password is required to delete your account' }],
    });
  }

  req.validatedBody = { password };
  next();
}

module.exports = {
  validateSignup,
  validateSignin,
  validateProfileUpdate,
  validateChangePassword,
  validateDeleteAccount,
  validateAdminLogin,
  validateAdminCredentials,
  validateUserIdParam,
};
