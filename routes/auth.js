const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

//Create a User using: POST "/api/auth/createuser". No login required.
router.post(
    '/createuser', [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
    ],

    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({ error: "Email already exists!" })
            }
            user = new User(req.body);
            await user.save();
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

module.exports = router;