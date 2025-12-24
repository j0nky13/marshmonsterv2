import { useEffect, useState, useMemo } from "react";
import {
  listMessages,
  updateMessageStatus,
  markMessageRead,
  deleteMessage,
  markMessageConverted,
} from "../../../lib/messagesApi";
import { convertMessageToProject } from "../lib/projectsApi";

export default function Inbox({ profile }) {
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showConvert, setShowConvert] = useState(false);
  const [converting, setConverting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    goal: "",
    pages: "",
    domain: "",
    graphics: false,
    budget: "",
    timeline: "",
    notes: "",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    let allMessages = await listMessages();
    if (profile.role === "user") {
      allMessages = allMessages.filter(
        (m) =>
          m.clientUid === profile.uid ||
          m.email === profile.email
      );
    }
    setMessages(allMessages);
    setLoading(false);
  }

  const threads = useMemo(() => {
    const map = new Map();
    for (const m of messages) {
      const threadId = m.threadId || m.id;
      if (!map.has(threadId)) {
        map.set(threadId, []);
      }
      map.get(threadId).push(m);
    }
    // Sort messages in each thread by createdAt ascending
    const sortedThreads = [];
    for (const [threadId, msgs] of map.entries()) {
      msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      sortedThreads.push({ threadId, messages: msgs });
    }
    // Sort threads by latest message createdAt descending
    sortedThreads.sort(
      (a, b) =>
        new Date(b.messages[b.messages.length - 1].createdAt) -
        new Date(a.messages[a.messages.length - 1].createdAt)
    );
    return sortedThreads;
  }, [messages]);

  async function openMessage(thread) {
    setActive(thread);
    const unreadMessages = thread.messages.filter((m) => !m.read);
    for (const m of unreadMessages) {
      await markMessageRead(m.id);
    }
    await load();
  }

  async function remove(id) {
    if (!confirm("Delete this message?")) return;
    await deleteMessage(id);
    setActive(null);
    await load();
  }

  // Find the earliest client-originated message in the thread (bulletproof)
  let clientMessageId = null;
  let firstClientMessage = null;

  if (active?.messages?.length) {
    const sorted = [...active.messages].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Priority 1: explicit clientUid
    firstClientMessage = sorted.find((m) => !!m.clientUid);

    // Priority 2: role or sender hint
    if (!firstClientMessage) {
      firstClientMessage = sorted.find(
        (m) => m.role === "user" || m.from === "client"
      );
    }

    // Priority 3: fallback to first message in thread
    if (!firstClientMessage) {
      firstClientMessage = sorted[0];
    }

    if (firstClientMessage?.id) {
      clientMessageId = firstClientMessage.id;
    }
  }

  // Thread is converted if ANY message in the thread is converted
  const alreadyConverted = !!(active?.messages?.some((m) => m.convertedToProject === true));

  function openConvertModal() {
    if (!active) {
      alert("No thread selected");
      return;
    }

    if (!clientMessageId || !firstClientMessage) {
      console.warn("Convert blocked — missing client message", {
        active,
        clientMessageId,
        firstClientMessage,
      });
      alert("Cannot convert this thread — no client message found.");
      return;
    }

    setForm({
      title: `${firstClientMessage.name || "Client"} Project`,
      goal: "",
      pages: "1",
      domain: "",
      graphics: false,
      budget: "",
      timeline: "",
      notes: firstClientMessage.message || "",
    });

    setShowConvert(true);
  }

  async function convertToProject() {
    if (converting) return;
    if (!clientMessageId || !firstClientMessage || alreadyConverted) return;

    try {
      setConverting(true);

      const projectId = await convertMessageToProject(firstClientMessage, {
        title: form.title,
        goal: form.goal,
        pages: form.pages,
        domain: form.domain,
        graphics: form.graphics,
        budget: form.budget,
        timeline: form.timeline,
        notes: form.notes,
      });

      await markMessageConverted(clientMessageId, projectId);
      await updateMessageStatus(clientMessageId, "converted");

      setShowConvert(false);
      alert("Project created successfully!");
      setActive(null);
      await load();
    } catch (err) {
      console.error("CONVERT FAILED:", err);
      alert("Failed to convert message");
    } finally {
      setConverting(false);
    }
  }

  if (loading) {
    return <div className="text-slate-400">Loading inbox…</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {/* THREAD LIST */}
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        {threads.map((thread) => {
          const lastMessage = thread.messages[thread.messages.length - 1];
          const anyUnread = thread.messages.some((m) => !m.read);
          return (
            <button
              key={thread.threadId}
              onClick={() => openMessage(thread)}
              className={`w-full text-left px-4 py-3 border-b border-slate-800 hover:bg-slate-900 ${
                active?.threadId === thread.threadId ? "bg-slate-900" : ""
              }`}
            >
              <div className="flex justify-between">
                <span className={anyUnread ? "text-emerald-300" : "text-slate-200"}>
                  {lastMessage.name || "Anonymous"}
                </span>
                <span className="text-xs text-slate-500">
                  {lastMessage.convertedToProject ? "converted" : lastMessage.status}
                </span>
              </div>
              <div className="text-xs text-slate-400 truncate">{lastMessage.message}</div>
            </button>
          );
        })}
      </div>

      {/* THREAD DETAIL */}
      <div className="md:col-span-2 border border-slate-800 rounded-lg p-4 flex flex-col h-full">
        {!active ? (
          <div className="text-slate-500">Select a message</div>
        ) : (
          <>
            <div className="flex flex-col space-y-4 overflow-y-auto mb-4 max-h-[60vh] pr-2">
              {active.messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-slate-950 border border-slate-800 rounded p-3 text-sm"
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-semibold text-slate-200">
                      {msg.name || "Anonymous"}
                    </div>
                    <div className="text-xs text-slate-400 italic">
                      {msg.clientUid ? "Client" : "Admin"}
                    </div>
                  </div>
                  <div>{msg.message}</div>
                </div>
              ))}
            </div>

            <div className="mt-auto">
            <div className="mt-4 flex items-center gap-2">
              {profile.role === "admin" && active && (
                <button
                  onClick={openConvertModal}
                  disabled={!clientMessageId || alreadyConverted}
                  className={`px-3 py-1 text-xs rounded border transition ${
                    !clientMessageId
                      ? "border-slate-700 text-slate-500 cursor-not-allowed"
                      : alreadyConverted
                      ? "border-slate-700 text-slate-500 cursor-not-allowed"
                      : "border-emerald-600 text-emerald-400 hover:bg-emerald-900/20"
                  }`}
                >
                  {!clientMessageId
                    ? "No Client Message"
                    : alreadyConverted
                    ? "Already Converted"
                    : "Convert to Project"}
                </button>
              )}

              {profile.role === "admin" && active && firstClientMessage && (
                <button
                  onClick={() => remove(firstClientMessage.id)}
                  className="ml-auto px-3 py-1 text-xs rounded border border-red-700 text-red-400 hover:bg-red-900/20"
                >
                  Delete
                </button>
              )}
            </div>

              {/* Reply box */}
              <div className="mt-4">
                <label className="block text-xs text-slate-400 mb-1">
                  Reply
                </label>
                <textarea
                  rows={3}
                  disabled
                  className="w-full rounded bg-black/40 border border-white/10 px-3 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none resize-none"
                  placeholder="Reply feature coming soon"
                />
                <button
                  disabled
                  // TODO: wire sendMessage()
                  className="mt-2 px-4 py-2 text-xs font-semibold rounded bg-emerald-500 text-black opacity-60 cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CONVERT MODAL */}
      {showConvert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f141b] border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-emerald-400">
                Convert Message → Project
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Add requirements so the project page isn’t empty later.
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Project / Site Name
                </label>
                <input
                  value={form.title}
                  className="w-full rounded bg-black/40 border border-white/10 px-3 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none"
                  placeholder="Client Website Redesign"
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Primary Goal
                </label>
                <input
                  value={form.goal}
                  className="w-full rounded bg-black/40 border border-white/10 px-3 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none"
                  placeholder="Generate leads / Improve performance"
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Number of Pages
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.pages}
                    className="w-full rounded bg-black/40 border border-white/10 px-3 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none"
                    onChange={(e) => setForm({ ...form, pages: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Current Domain
                  </label>
                  <input
                    value={form.domain}
                    className="w-full rounded bg-black/40 border border-white/10 px-3 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none"
                    placeholder="example.com"
                    onChange={(e) =>
                      setForm({ ...form, domain: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Budget (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={form.budget}
                    className="w-full rounded bg-black/40 border border-white/10 px-3 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none"
                    placeholder="8000"
                    onChange={(e) =>
                      setForm({ ...form, budget: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Timeline Requirement
                  </label>
                  <input
                    value={form.timeline}
                    className="w-full rounded bg-black/40 border border-white/10 px-3 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none"
                    placeholder="4 weeks / ASAP / by Jan 15"
                    onChange={(e) =>
                      setForm({ ...form, timeline: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Graphics toggle */}
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-4 py-3">
                <div>
                  <div className="text-sm text-slate-200">
                    Branding / Graphics Needed
                  </div>
                  <div className="text-xs text-slate-400">
                    Logo work, visual identity, or custom assets
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, graphics: !f.graphics }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    form.graphics ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-black transition ${
                      form.graphics ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  More Notes
                </label>
                <textarea
                  rows={5}
                  value={form.notes}
                  className="w-full rounded bg-black/40 border border-white/10 px-3 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none resize-none"
                  placeholder="Add anything: features needed, inspiration links, deliverables, hosting, integrations, etc…"
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setShowConvert(false)}
                className="px-4 py-2 text-xs rounded border border-white/10 text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                disabled={converting}
                onClick={convertToProject}
                className="px-5 py-2 text-xs font-semibold rounded bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-60"
              >
                {converting ? "Creating…" : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}