const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = "WhatgoesAroundComesAround"

// Create a User using: POST "/api/auth/createuser". No login required.
router.post(
    '/createuser', [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
    ],

    async(req, res) => {
        //If there are errors returns bad request and the error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Check whether the user with the same email already exists
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({ error: "Email already exists!" });
            }

            // Generate salt and hash the password
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);

            // Create a new user with the hashed password
            user = new User({
                name: req.body.name,
                email: req.body.email,
                password: secPass
            });
            await user.save();

            //Generate JWT token
            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET);
            res.status(201).json({ authToken });

        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

// Authenticate a User using: POST "/api/auth/login". No login required.
router.post(
    '/login', [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').exists().withMessage('Password cannot be blank')
    ],
    async(req, res) => {
        // If there are errors, return bad request and the error messages
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            // Find user by email
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: "Please provide correct credentials!" });
            }

            // Compare password
            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                return res.status(400).json({ error: "Please provide correct credentials!" });
            }

            // Generate JWT token
            const data = {
                user: {
                    id: user.id
                }
            };
            const authToken = jwt.sign(data, JWT_SECRET);
            res.status(200).json({ authToken });
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

module.exports = router;