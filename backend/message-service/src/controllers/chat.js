import Chat from "../model/chat.js";

/**
 * Creates a one-to-one chat between two users. If a chat already exists between the two users, it returns the existing chat.
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const createOrGetChat = async (req, res) => {
  try {
    console.log("[createOrGetChat]", req.body);

    const { userIdOne, userIdTwo } = req.body;
    const chat = await Chat.findOne({
      users: { $all: [userIdOne, userIdTwo] },
    });

    if (chat) {
      console.log("[createOrGetChat] Chat found");
      return res.status(200).json(chat);
    }

    const newChat = new Chat({ users: [userIdOne, userIdTwo] });
    const response = await newChat.save();

    console.log("[createOrGetChat] Chat created");
    res.status(201).json(response);
  } catch (error) {
    console.log("[createOrGetChat] Error: ", error.message);
    res.status(409).json({ message: error.message });
  }
};

/**
 * Gets all the chats of a user. If not chats are found, it returns an empty array.
 * @param {*} req
 * @param {*} res
 */
export const getUserChats = async (req, res) => {
  try {
    console.log("[getUserChats]");

    const { userId } = req.params;
    const chats = await Chat.find({ users: { $in: Number(userId) } });

    console.log(`[getUserChats] ${chats.length} chats found`);
    res.status(200).json(chats);
  } catch (error) {
    console.log("[getUserChats] Error: ", error.message);
    res.status(404).json({ message: error.message });
  }
};
