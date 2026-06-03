import * as authService from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const result = await authService.logout();
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const result = await authService.verifyOtp(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function resendOtp(req, res, next) {
  try {
    const result = await authService.resendOtp(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const result = await authService.changePassword(req.user.id, req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await authService.listUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const user = await authService.updateUserRole(req.params.id, req.body.role);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

export async function verifyToken(req, res, next) {
  try {
    const { token } = req.body;
    const result = await authService.verifyTokenInternal(token);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}
