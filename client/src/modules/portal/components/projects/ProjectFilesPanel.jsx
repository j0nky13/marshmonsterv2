import { useEffect, useState } from "react";
import { File, Trash2, Upload } from "lucide-react";
import { apiFetch } from "../../api/api";

const API_ROOT = "http://localhost:5050";

export default function ProjectFilesPanel({ project, role }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadFiles() {
    try {
      setLoading(true);
      const data = await apiFetch(`/files/project/${project._id}`);
      setFiles(data.files || []);
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (project?._id) {
      loadFiles();
    }
  }, [project?._id]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const email = localStorage.getItem("devEmail");
    const formData = new FormData();

    formData.append("file", file);
    formData.append("visibility", "customer");

    setUploading(true);

    try {
      const response = await fetch(
        `${API_ROOT}/api/files/project/${project._id}`,
        {
          method: "POST",
          headers: {
            "x-dev-email": email || ""
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      setFiles((prev) => [data.file, ...prev]);
      e.target.value = "";
    } catch (error) {
      alert(error.message || "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  }

  async function deleteFile(fileId) {
    const confirmed = window.confirm("Delete this file?");
    if (!confirmed) return;

    try {
      await apiFetch(`/files/${fileId}`, {
        method: "DELETE"
      });

      setFiles((prev) => prev.filter((file) => file._id !== fileId));
    } catch (error) {
      alert(error.message || "Failed to delete file.");
    }
  }

  return (
    <div className="bg-black border border-zinc-800 rounded-2xl p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-black text-white">Project Files</p>
          <p className="text-xs text-zinc-500">
            Upload assets, documents, screenshots, copy, logos, or references.
          </p>
        </div>

        <label className="cursor-pointer rounded-xl bg-lime-400 text-black font-bold px-4 py-2 hover:bg-lime-300 flex items-center justify-center gap-2">
          <Upload size={16} />
          {uploading ? "Uploading..." : "Upload"}
          <input
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading files...</p>
      ) : files.length === 0 ? (
        <p className="text-zinc-500 text-sm">No files uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file._id}
              className="flex items-center justify-between gap-3 bg-zinc-950 border border-zinc-800 rounded-xl p-3"
            >
              <a
                href={`${API_ROOT}/${file.filePath}`}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex items-center gap-3 group"
              >
                <File size={18} className="text-lime-400 shrink-0" />

                <div className="min-w-0">
                  <p className="text-sm text-white font-semibold truncate group-hover:text-lime-400">
                    {file.originalName}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {formatSize(file.size)} · Uploaded by{" "}
                    {file.uploadedBy?.name ||
                      file.uploadedBy?.email ||
                      "Unknown"}
                  </p>
                </div>
              </a>

              {(role === "admin" ||
                role === "staff" ||
                file.uploadedBy?._id) && (
                <button
                  onClick={() => deleteFile(file._id)}
                  className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 p-2 hover:bg-red-500/20"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatSize(bytes = 0) {
  if (!bytes) return "0 B";

  const kb = bytes / 1024;
  const mb = kb / 1024;

  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }

  return `${kb.toFixed(1)} KB`;
}