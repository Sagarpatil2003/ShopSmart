const express = require("express")
const authMiddleware = require("../middlewares/authMiddlewares")
const { getCartList, addToCart, updateCart, deleteCart, deleteAll} = require("../controllers/cartController")
const CartRouter = express.Router()

CartRouter.get('/', authMiddleware(['user', 'admin']), getCartList)

CartRouter.post('/add-to-cart', authMiddleware(['user']), addToCart)

CartRouter.put('/update', authMiddleware(['user']), updateCart)

CartRouter.delete('/delete/:productId', authMiddleware(['user']), deleteCart)

CartRouter.delete("/clear", authMiddleware(['user']), deleteAll)


module.exports = CartRouter