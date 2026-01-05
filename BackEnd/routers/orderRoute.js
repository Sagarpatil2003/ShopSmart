const express = require('express')
const authMiddleware = require('../middlewares/authMiddlewares')
const {
    orderAllCartItem,
    orderSelectedFromCart,
    buyNowOrder,
    returnOrder,
    getHistory,
    getOrderById
} 
= require('../controllers/orderController')

let OrderRouter = express.Router()


OrderRouter.get('/order-history', authMiddleware(["user"]), getHistory)




module.exports = OrderRouter


