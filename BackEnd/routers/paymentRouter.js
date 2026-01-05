const express = require('express')
const crypto = require('crypto')
const razorpay = require('../config/razorpayConfig')
const OrderModel = require('../models/orderModel')
const PaymentModel = require('../models/paymentModel')
const authMiddleware = require('../middlewares/authMiddlewares')
const { createOrder, webHookVerification } = require('../controllers/paymentController')

const PaymentRouter = express.Router()

PaymentRouter.post('/create-order/:orderId', authMiddleware(['user']), createOrder )

PaymentRouter.post("/webhook",express.raw({ type: "application/json" }),webHookVerification)

module.exports = PaymentRouter