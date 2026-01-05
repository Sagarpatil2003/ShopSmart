const express = require('express')
const path = require("path")

const envFile =
  process.env.NODE_ENV === "test"
    ? ".env.testing"
    : ".env"

require("dotenv").config({
  path: path.resolve(process.cwd(), envFile)
})

const connectToDB = require('./config/mongoDBConfig')
const userRouter = require('./routers/userRouter')
const morgan = require('morgan')
const ProductRouter = require('./routers/productRouter')
const CartRouter = require('./routers/cartRouter')
const PaymentRouter = require('./routers/paymentRouter')
const OrderRouter = require('./routers/orderRoute')


const app = express()
app.use("/payment/webhook", express.raw({ type: "application/json" }))

app.use(express.json())
app.use(morgan('dev'))

// app router 
app.use('/users', userRouter)
app.use('/products', ProductRouter)
app.use('/cart', CartRouter)
app.use('/payment', PaymentRouter)
app.use('/order', OrderRouter)

app.get('/test', (req, res) => {
    try {
       res.status(200).json({message: 'app is working'})
    }catch (error) {
       res.status(500).json({message: 'somthing went wrong'})
    }
})
// handle undefined Api 
app.get((req, res) => {
    try {
        res.status(200).json({ message: 'This Page Is Not Created' })
    } catch (error) {
        res.status(500).json({ message: 'Something Went Wrong, Please Try Again leater' })
    }
})

if (process.env.NODE_ENV !== "test") {
    connectToDB()
   app.listen(process.env.PORT|| 3000,"0.0.0.0", () => console.log(`Application running ON ${process.env.PORT} ...`))
}

module.exports = app