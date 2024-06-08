import Message from "../model/message.js";

/**
 * Create a new message providing the chatId, senderId and the message.
 * @param {*} req
 * @param {*} res
 */
export const createMessage = async (req, res) => {
  try {
    console.log("[createMessage]");

    const { chatId, senderId, message } = req.body;
    const newMessage = new Message({ chatId, senderId, message });
    const response = await newMessage.save();

    console.log("[createMessage] Message created");
    res.status(201).json(response);
  } catch (error) {
    console.log("[createMessage] Error: ", error.message);
    res.status(409).json({ message: error.message });
  }
};

/**
 * Get all the messages of a chat, given a chatId. If no chats are found, an empty array is returned.
 * @param {*} req
 * @param {*} res
 */
export const getMessages = async (req, res) => {
  try {
    console.log("[getMessages]");

    const { chatId } = req.params;
    const messages = await Message.find({ chatId });

    console.log(`[getMessages] ${messages.length} messages found`);
    res.status(200).json(messages);
  } catch (error) {
    console.log("[getMessages] Error: ", error.message);
    res.status(404).json({ message: error.message });
  }
};
