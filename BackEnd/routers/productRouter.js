const express = require('express')
const authMiddleware = require('../middlewares/authMiddlewares')
const { createProduct, updateProduct, deleteProduct, updateInventory, productList, getProduct, searchProduct } = require('../controllers/productControllers')
const ProductRouter = express.Router()

// admin crud api
ProductRouter.post('/create', authMiddleware(['admin']), createProduct)

ProductRouter.put('/update-product/:id', authMiddleware(['admin']), updateProduct)

ProductRouter.delete('/delete-product/:id', authMiddleware(['admin']), deleteProduct)

ProductRouter.post('/update-inventory/:id', authMiddleware(['admin']), updateInventory)

// User api
ProductRouter.get('/product-list', productList)

ProductRouter.get('/product/:id', getProduct)

ProductRouter.get("/search", searchProduct)


module.exports = ProductRouter