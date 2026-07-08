const Contact = require("../models/contact");

const CreateContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(401).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        const newContact = await Contact.create({
            name,
            email,
            message
        });

        return res.status(201).json({
            success: true,
            message: "Contact Submitted Successfully",
            data: newContact
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const FetchContact = async (req, res) => {
    try {
        const allContacts = await Contact.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: allContacts.length,
            data: allContacts
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        await Contact.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Contact deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    CreateContact,
    FetchContact,
    deleteContact
};