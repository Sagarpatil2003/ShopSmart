jest.mock('nodemailer', () => {
    const mockSendMail = jest.fn().mockResolvedValue(true)

    return {
        createTransport: jest.fn(() => ({
            sendMail: mockSendMail
        })),
        __mockSendMail: mockSendMail
    }
})
const request = require('supertest')
const app = require('../server')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const UserModel = require('../models/userModel')
const ProductModel = require('../models/productModel')
const OrderModel = require('../models/orderModel')
const nodemailer = require('nodemailer')
const mockSendMail = nodemailer.__mockSendMail


const userInfo = {
    name: 'Khushal Patil',
    email: 'kh@gmail.com',
    password: 'pass123'
}


beforeEach(async () => {
    await UserModel.deleteOne({ email: userInfo.email })
})


describe('Authentication API', () => {

    test('POST /users/signup - should create a new user', async () => {
        const res = await request(app)
            .post('/users/signup')
            .send(userInfo)

        expect(res.statusCode).toBe(201)
        expect(res.body.message).toBe('User Sign-Up Successfully')
    })

    test('POST /users/login - should login with valid credentials', async () => {
        await request(app).post('/users/signup')
            .send(userInfo)

        let res = await request(app).post('/users/login')
            .send({ email: userInfo.email, password: userInfo.password })

        // const token = `Bearer ${res.body.accessToken}`

        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe('Login Successfully')
    })

    test('POST /users/forget-password - should send reset link', async () => {
        await request(app)
            .post('/users/signup')
            .send(userInfo)

        const res = await request(app)
            .post('/users/forget-password')
            .send({ email: userInfo.email })

        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe('Reset link sent to email')
        expect(mockSendMail).toHaveBeenCalled();
    })

    test('POST /users/reset-password - should reset password with valid token', async () => {
        await request(app).post('/users/signup').send(userInfo)

        const resetToken = crypto.randomBytes(32).toString('hex')
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex')

        await UserModel.updateOne(
            { email: userInfo.email },
            {
                resetPasswordToken: hashedToken,
                resetPasswordExpiry: Date.now() + 3 * 60 * 1000
            }
        )

        let res = await request(app).post(`/users/reset-password?token=${resetToken}`)
            .send({ newPassword: "pass321" })

        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe('Password reset successful')

        const updatedUser = await UserModel.findOne({ email: userInfo.email })
        const isMatch = await bcrypt.compare("pass321", updatedUser.password)

        expect(isMatch).toBe(true)


    })

    test('GET /users/user-profile - should return the logged-in user detail', async () => {
        await request(app).post('/users/signup').send(userInfo)

        const loginRes = await request(app).post('/users/login').send({ email: userInfo.email, password: userInfo.password })

        const token = `Bearer ${loginRes.body.accessToken}`

        let res = await request(app).get('/users/user-profile')
            .set('Authorization', token)

        expect(res.statusCode).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.user.email).toBe(userInfo.email)
        expect(res.body.user.password).toBeUndefined()
    })

    test('PUT /users/update-profile - should update user profile', async () => {
        await request(app).post('/users/signup')
            .send(userInfo)

        let loginRes = await request(app).post('/users/login')
            .send({ email: userInfo.email, password: userInfo.password })

        const token = `Bearer ${loginRes.body.accessToken}`

        const updatedData = {
            name: 'Khushal P',
            addresses: [{ phone: '1234567890', street: '123 Main St', city: 'Pune', state: 'MH', pincode: '411001' }]
        }

        let res = await request(app).put('/users/update-profile')
            .set('Authorization', token)
            .send(updatedData)

        // console.log(res.body.updatedUser)
        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe("Profile updated")
        expect(res.body.updatedUser.name).toBe(updatedData.name)
        expect(res.body.updatedUser.addresses[0].phone).toBe(updatedData.addresses[0].phone)
        expect(res.body.updatedUser.addresses[0].city).toBe(updatedData.addresses[0].city)
        expect(res.body.updatedUser.password).toBeUndefined()
    })

    test('GET /users/history - should return the user olders', async () => {
        await request(app).post('/users/signup')
            .send(userInfo)

        let loginRes = await request(app).post('/users/login')
            .send({ email: userInfo.email, password: userInfo.password })

        const token = `Bearer ${loginRes.body.accessToken}`

        let product_1 = await ProductModel.create({ title: 'Product_1', description: "This product use for testing", price: 100, category: 'api testing', brand: 'Api pro', images: [], stock: 10 })
        let product_2 = await ProductModel.create({ title: 'Product_2', description: "This product use for testing", price: 100, category: 'api testing', brand: 'Api pro', images: [], stock: 10 })
        let user = await UserModel.findOne({ email: userInfo.email })

        await OrderModel.create({
            user: user._id,
            items: [
                { product: product_1._id, quantity: 2 },
                { product: product_2._id, quantity: 1 }
            ]
        })

        let res = await request(app)
            .get('/users/history')
            .set('Authorization', token)

        expect(res.statusCode).toBe(200)


    })
})
