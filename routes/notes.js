const express = require('express');
const { body, validationResult } = require('express-validator');
const Notes = require('../models/Notes');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();

//ROUTE:1 Create a Note using : POST "/api/notes/createnotes" login required
router.post('/addnotes', fetchuser, [
        body('title', "Enter a title!").notEmpty(),
        body('description', "Enter description of the note!").notEmpty()
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, description, tag } = req.body;
        try {
            const note = new Notes({
                title,
                description,
                tag,
                user: req.user.id
            })
            await note.save()
            res.status(201).json(note);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

//ROUTE:2 Get all the notes using: GET "/api/auth/fetchallnotes".Login required

router.get('/fetchallnotes', fetchuser, async(req, res) => {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes)
})
module.exports = router;