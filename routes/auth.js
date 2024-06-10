const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = "WhatgoesAroundComesAround";

// ROUTE:1 Create a User using: POST "/api/auth/createuser". No login required.
router.post(
    '/createuser', [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({ success: false, error: "Email already exists!" });
            }

            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);

            user = new User({
                name: req.body.name,
                email: req.body.email,
                password: secPass
            });
            await user.save();

            const data = {
                user: {
                    id: user.id
                }
            };
            const authToken = jwt.sign(data, JWT_SECRET);
            res.status(201).json({ success: true, authToken });

        } catch (error) {
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
);

// ROUTE:2 Authenticate a User using: POST "/api/auth/login". No login required.
router.post(
    '/login', [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').exists().withMessage('Password cannot be blank')
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ success: false, error: "Please provide correct credentials!" });
            }

            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                return res.status(400).json({ success: false, error: "Please provide correct credentials!" });
            }

            const data = {
                user: {
                    id: user.id
                }
            };
            const authToken = jwt.sign(data, JWT_SECRET);
            res.status(200).json({ success: true, authToken });
        } catch (error) {
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
);

// ROUTE:3 Get logged in user details: POST "/api/auth/getuser" required login.
router.post(
    '/getuser', fetchuser,
    async(req, res) => {
        try {
            const userID = req.user.id;
            const user = await User.findById(userID).select("-password");
            res.status(200).json({ success: true, user, name: user.name });
        } catch (error) {
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
);

module.exports = router;