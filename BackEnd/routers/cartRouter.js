const express = require("express")
const authMiddleware = require("../middlewares/authMiddlewares")
const CartModel = require("../models/cartModel")
const ProductModel = require("../models/productModel")
const { getCartList, addToCart, updateCart, deleteCart, deleteAll } = require("../controllers/cartController")
const redis = require("../config/redisConfig")
const CartRouter = express.Router()

CartRouter.get('/', authMiddleware(['user', 'admin']), getCartList)

CartRouter.post('/add-to-cart', authMiddleware(['user']), addToCart)

CartRouter.put('/update', authMiddleware(['user']), updateCart)

CartRouter.delete('/delete/:productId', authMiddleware(['user']), deleteCart)

CartRouter.delete("/clear", authMiddleware(['user']), deleteAll)

module.exports = CartRouter