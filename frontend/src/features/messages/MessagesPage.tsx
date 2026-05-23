import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { RootState, AppDispatch } from "../../store";
import { fetchMessages, markMessageRead, Message } from "./messagesSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

export default function MessagesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, loading } = useSelector(
    (state: RootState) => state.messages,
  );

  useEffect(() => {
    dispatch(fetchMessages());
  }, [dispatch]);

  const handleMarkRead = (id: string) => {
    dispatch(markMessageRead(id));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No messages yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg: Message) => (
            <Card
              key={msg.id}
              className={`hover:shadow-md transition ${!msg.read ? "border-l-4 border-l-blue-500" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={msg.fromAvatar} />
                      <AvatarFallback>{msg.from.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{msg.from}</CardTitle>
                      <p className="text-xs text-gray-400">{msg.time}</p>
                    </div>
                  </div>
                  {!msg.read && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkRead(msg.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{msg.message}</p>
                {msg.jobId && (
                  <Link
                    to={`/jobs/${msg.jobId}`}
                    className="text-blue-600 text-sm mt-2 inline-block"
                  >
                    View Job
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
