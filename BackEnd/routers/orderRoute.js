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

OrderRouter.get('/order/:orderId', authMiddleware(["user"]), getOrderById)

OrderRouter.post('/buy-all-items', authMiddleware(['user']), orderAllCartItem)

OrderRouter.post('/buy-selected-items', authMiddleware(['user']), orderSelectedFromCart)




module.exports = OrderRouter


