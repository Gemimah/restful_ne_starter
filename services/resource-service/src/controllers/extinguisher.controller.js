import * as extinguisherService from '../services/extinguisher.service.js';

export async function getAll(req, res, next) {
  try {
    const result = await extinguisherService.getAll(req.query, req.user);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const data = await extinguisherService.getById(req.params.id, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const data = await extinguisherService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const data = await extinguisherService.update(req.params.id, req.body, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function assignInspector(req, res, next) {
  try {
    const { assignedInspectorId } = req.body;
    const data = await extinguisherService.assignInspector(req.params.id, assignedInspectorId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await extinguisherService.remove(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}
