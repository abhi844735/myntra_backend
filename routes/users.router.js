const express = require('express');
const cookie = require('cookie');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config()

const { UserModel } = require('../models/Users.model')
const {BlacklistModel} = require('../models/Blacklist.model');
const { authentication } = require('../middlewares/Authentication.middleware');

const userRouter = express.Router();

userRouter.get('/', async (req, res) => {
    const users = await UserModel.find();
    res.send(users)
})

userRouter.post('/signup', async (req, res) => {
    const {email, password, mobile, gender, name} = req.body;
    if(!name||!gender||!mobile||!password) {
        return res.status(409).send({message: 'Please provide all fields'})
    }
    try {
        const userExists = await UserModel.findOne({mobile});
        if(userExists) {
            return res.status(409).send({message: 'Mobile number already registered'})
        }
        bcrypt.hash(password, +process.env.saltRounds, async function (err, hashedPass) {
            if (err) {
                return res.status(404).send({ message: err.message })
            }
            try {
                const user = new UserModel({
                    name, email, password: hashedPass, mobile, gender
                })
                await user.save()
                const userBlack = new BlacklistModel({
                    userId: user._id
                })
                await userBlack.save()
                res.send({ message: 'User Registered Sucessfully' })
            } catch (error) {
                console.log(error)
                return res.status(404).send({ message: error.message })
            }
        });
    } catch (error) {
        return res.status(500).send({message: error.message})
    }
})


userRouter.post('/login', async (req, res) => {
    const {mobile, password} = req.body;
    try {
        const user = await UserModel.findOne({mobile});
        if(!user) {
            return res.status(404).send({message: 'User not found'})
        }
        bcrypt.compare(password, user.password, async function (err, result) {
            if (err) {
                return res.status(404).send({ message: err.message })
            }
            if (result) {
                var token = jwt.sign({ id: user._id, role: 'user' }, process.env.LOGIN_TOKEN_SECRET);
                res.setHeader('Set-Cookie', cookie.serialize('token', token, {
                    httpOnly: true,
                    maxAge: 60 * 60 * 24
                }));
                res.send({ message: 'Login Sucessful', token, name: user.name })
            } else {
                res.status(403).send({ message: 'Wrong Credentials' })
            }
        });
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})

userRouter.post('/logout', authentication, async (req, res) => {
    const token = req.headers.authorization;
    const {id} = req.body.token;
    try {
        const Blacklist = await BlacklistModel.findOne({userId: id})
        Blacklist.tokens.push(token);
        Blacklist.save();
        res.send({message: 'Logout Sucessfull'})
    } catch (error) {
        return res.status(500).send({message: error.message})
    }
})

module.exports = {
    userRouter
}

