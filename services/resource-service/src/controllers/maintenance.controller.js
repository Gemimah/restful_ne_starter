import * as maintenanceService from '../services/maintenance.service.js';

export async function getAll(req, res, next) {
  try {
    const result = await maintenanceService.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const data = await maintenanceService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const data = await maintenanceService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
