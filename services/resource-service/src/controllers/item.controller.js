import * as itemService from '../services/item.service.js';

export async function getAll(req, res, next) {
  try {
    const result = await itemService.getAll(req.query, req.user.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const item = await itemService.getById(req.params.id, req.user.id);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const item = await itemService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const item = await itemService.update(req.params.id, req.body, req.user.id);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await itemService.remove(req.params.id, req.user.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}
