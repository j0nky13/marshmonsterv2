import { useEffect, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { apiFetch } from "../../api/api";

export default function ProjectMessagesPanel({ project, role }) {
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState("customer");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function loadMessages() {
    try {
      setLoading(true);
      const data = await apiFetch(`/messages/project/${project._id}`);
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (project?._id) {
      loadMessages();
    }
  }, [project?._id]);

  async function sendMessage(e) {
    e.preventDefault();

    if (!body.trim()) return;

    setSending(true);

    try {
      const data = await apiFetch(`/messages/project/${project._id}`, {
        method: "POST",
        body: JSON.stringify({
          body,
          visibility
        })
      });

      setMessages((prev) => [...prev, data.message]);
      setBody("");
      setVisibility("customer");
    } catch (error) {
      alert(error.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  async function deleteMessage(messageId) {
    const confirmed = window.confirm("Delete this message?");
    if (!confirmed) return;

    try {
      await apiFetch(`/messages/${messageId}`, {
        method: "DELETE"
      });

      setMessages((prev) =>
        prev.filter((message) => message._id !== messageId)
      );
    } catch (error) {
      alert(error.message || "Failed to delete message.");
    }
  }

  return (
    <div className="bg-black border border-zinc-800 rounded-2xl p-4 space-y-4">
      <div>
        <p className="font-black text-white">Project Messages</p>
        <p className="text-xs text-zinc-500">
          Customer, staff, and admin communication tied to this project.
        </p>
      </div>

      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
        {loading ? (
          <p className="text-zinc-500 text-sm">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-zinc-500 text-sm">
            No messages yet. Start the project thread below.
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              role={role}
              onDelete={() => deleteMessage(message._id)}
            />
          ))
        )}
      </div>

      <form onSubmit={sendMessage} className="space-y-3">
        {role !== "customer" && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setVisibility("customer")}
              className={`rounded-xl px-3 py-2 text-sm font-bold border ${
                visibility === "customer"
                  ? "bg-lime-400 text-black border-lime-400"
                  : "bg-zinc-950 text-zinc-300 border-zinc-800"
              }`}
            >
              Customer Visible
            </button>

            <button
              type="button"
              onClick={() => setVisibility("internal")}
              className={`rounded-xl px-3 py-2 text-sm font-bold border ${
                visibility === "internal"
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-zinc-950 text-zinc-300 border-zinc-800"
              }`}
            >
              Internal Note
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              visibility === "internal"
                ? "Write an internal note..."
                : "Write a message..."
            }
            className="min-h-20 flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400"
          />

          <button
            disabled={sending || !body.trim()}
            className="self-stretch rounded-2xl bg-lime-400 text-black px-4 font-bold hover:bg-lime-300 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message, role, onDelete }) {
  const isInternal = message.visibility === "internal";

  return (
    <div
      className={`rounded-2xl border p-4 ${
        isInternal
          ? "bg-yellow-500/10 border-yellow-500/30"
          : "bg-zinc-950 border-zinc-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-white">
            {message.senderId?.name ||
              message.senderId?.email ||
              "Unknown User"}
          </p>

          <p className="text-xs text-zinc-500">
            {message.senderId?.role || "user"} · {formatDate(message.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isInternal && (
            <span className="rounded-full bg-yellow-400 text-black text-[10px] font-black px-2 py-1">
              INTERNAL
            </span>
          )}

          {role !== "customer" && (
            <button
              onClick={onDelete}
              className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 p-2 hover:bg-red-500/20"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <p className="text-zinc-300 mt-3 whitespace-pre-wrap">{message.body}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}