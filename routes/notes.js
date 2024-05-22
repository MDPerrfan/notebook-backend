const express = require('express');
const { body, validationResult } = require('express-validator');
const Notes = require('../models/Notes');
const router = express.Router();

//Create a Note using : POST "/api/notes/createnotes" login required
router.post('/createnotes', [
        body('title', "Enter a title!"),
        body('description', "Enter description of the note!")
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const note = new Notes(req.body)
            await note.save()
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
module.exports = router;