import asyncHandler from 'express-async-handler';
import dropService from '../services/DropService.js';

export const getPublicDrops = asyncHandler(async (req, res) => {
  const drops = await dropService.getPublicDrops();
  res.json(drops);
});

export const getDropById = asyncHandler(async (req, res) => {
  const drop = await dropService.getDropBySlugOrId(req.params.slugOrId);
  res.json(drop);
});

export const getAllDropsAdmin = asyncHandler(async (req, res) => {
  const drops = await dropService.getAllDropsAdmin();
  res.json(drops);
});

export const createDrop = asyncHandler(async (req, res) => {
  const drop = await dropService.createDrop(req.body);
  res.status(201).json(drop);
});

export const updateDrop = asyncHandler(async (req, res) => {
  const drop = await dropService.updateDrop(req.params.id, req.body);
  res.json(drop);
});

export const deleteDrop = asyncHandler(async (req, res) => {
  await dropService.deleteDrop(req.params.id);
  res.json({ message: 'Drop deleted successfully' });
});

