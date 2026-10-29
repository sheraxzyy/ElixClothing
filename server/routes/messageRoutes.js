import express from 'express';
import {
  createMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage,
} from '../controllers/messageController.js';

const router = express.Router();

router.post('/', createMessage);
router.get('/', getMessages);
router.patch('/:id', updateMessageStatus);
router.delete('/:id', deleteMessage);

export default router;
