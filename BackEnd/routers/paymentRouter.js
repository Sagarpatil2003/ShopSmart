const express = require('express')

const authMiddleware = require('../middlewares/authMiddlewares')
const { createOrder, webHookVerification } = require('../controllers/paymentController')

const PaymentRouter = express.Router()

PaymentRouter.post('/create-order/:orderId', authMiddleware(['user']), createOrder )

PaymentRouter.post("/webhook",express.raw({ type: "application/json" }),webHookVerification)

module.exports = PaymentRouter