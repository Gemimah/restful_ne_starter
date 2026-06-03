import * as inspectionService from '../services/inspection.service.js';

export async function getAll(req, res, next) {
  try {
    await inspectionService.markOverdue();
    const result = await inspectionService.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const data = await inspectionService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function schedule(req, res, next) {
  try {
    const data = await inspectionService.schedule(req.body, req.user.id, req.user.email);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const data = await inspectionService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
