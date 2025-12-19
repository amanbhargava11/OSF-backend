import Contact from "../models/Contact.js";

export const submitContact = async (req, res) => {
  const contact = await Contact.create(req.body);
  res.status(201).json({
    message: "Message received",
    data: contact
  });
};
