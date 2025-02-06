import { Router } from "express";
import verifyJwtToken from "../middlewares/auth.middlewares.js";
import { createChat, deleteChat, getUserChats } from "../controllers/chat.controllers.js";
import { createMessage, deleteMessages, getMessages } from "../controllers/message.controllers.js";

const router = Router()

router.route('/').post(verifyJwtToken, createChat)
router.route('/message').post(verifyJwtToken, createMessage)

router.route('/').get(verifyJwtToken, getUserChats)
router.route('/messages/:chatId').get(verifyJwtToken, getMessages)

router.route('/:chatId').delete(verifyJwtToken, deleteChat)
router.route('/messages/:chatId').delete(verifyJwtToken, deleteMessages)

export default router
