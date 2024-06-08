import { getUser, getUserById } from "@/api/auth";
import { getUserChats } from "@/api/messages";
import CustomError from "@/components/CustomError";
import MaxWidthRapper from "@/components/MaxWidthWrapper";
import { AuthRequiredError } from "@/exceptions";
import { MessageSquareText } from "lucide-react";

export default async function Layout({ children }) {
  const user = await getUser();
  if (!user) return <CustomError error={AuthRequiredError} />;

  const activeChats = await getUserChats(user.id);
  let recipients = [];
  for (let chat of activeChats) {
    const recipient = await getUserById(
      chat.users.find((userId) => userId !== user.id)
    );
    if (!recipient) continue;
    recipients = recipients.concat(recipient);
    // Replace the id with the username
    chat.users = [user.username, recipient.username];
  }

  return (
    <MaxWidthRapper>
      <div className="w-full flex h-screen">
        <div className="md:flex h-full w-full max-w-fit grow flex-col  gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="font-semibold leading-6 mt-5 text-gray-400">
            Your chats
          </div>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul
                  role="list"
                  className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1"
                >
                  {activeChats.sort().map((chat, index) => {
                    const recipientUsername = chat.users.find(
                      (username) => username !== user.username
                    );

                    return (
                      <li key={chat._id} className="flex items-center">
                        <a
                          href={`/dashboard/chat/${chat._id}`}
                          className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 leading-6 font-semibold"
                        >
                          {recipientUsername}
                          <MessageSquareText
                            className="h-6 w-6 flex-shrink-0 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>

        <aside className="max-h-screen container py-16 md:py-12 w-full">
          {children}
        </aside>
      </div>
    </MaxWidthRapper>
  );
}
