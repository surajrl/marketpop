import { getUser, getUserById } from "@/api/auth";
import { getUserChats, getChatMessages } from "@/api/messages";
import ChatInput from "@/components/ChatInput";
import MaxWidthRapper from "@/components/MaxWidthWrapper";
import Messages from "@/components/Messages";
import CustomError from "@/components/CustomError";
import { AuthRequiredError, UnauthorizedError } from "@/exceptions";
import Image from "next/image";

export default async function Page({ params }) {
  const user = await getUser();
  if (!user) return <CustomError error={AuthRequiredError} />;

  // Get all the chats of the user
  const userChats = await getUserChats(user.id);
  // Find this specific chat or return unauthorized
  const chat = userChats.find((chat) => chat._id === params.chatId);
  if (!chat) return <CustomError error={UnauthorizedError} />;

  // Find the id of the recipient
  const recipientId = chat.users.find((userId) => userId !== user.id);
  // Get the recipient user
  const recipientUser = await getUserById(recipientId);
  if (!recipientUser)
    return <CustomError message={"The user has deleted the account"} />;

  // Get the messages of the chat
  const initialMessages = await getChatMessages(params.chatId);

  return (
    <MaxWidthRapper>
      <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
        <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
          <div className="relative flex items-center space-x-4">
            <div className="relative">
              <div className="relative w-8 sm:w-12 h-8 sm:h-12">
                <Image
                  fill
                  referrerPolicy="no-referrer"
                  src="/circle-user-round.svg"
                  alt={`${recipientUser.username} avatar`}
                  className="rounded-full"
                />
              </div>
            </div>

            <div className="flex flex-col leading-tight">
              <div className="text-xl flex items-center">
                <span className="text-gray-700 mr-3 font-semibold">
                  {recipientUser.username}
                </span>
              </div>

              <span className="text-sm text-gray-600">
                {recipientUser.email}
              </span>
            </div>
          </div>
        </div>

        <Messages
          chatId={params.chatId}
          user={user}
          initialMessages={initialMessages}
        />
        <ChatInput
          chatId={params.chatId}
          user={user}
          recipientUser={recipientUser}
        />
      </div>
    </MaxWidthRapper>
  );
}
