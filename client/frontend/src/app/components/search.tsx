"use client";

import { useState } from "react";

export default function SearchFile() {
  const [trackId, setTrackId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [fileContent, setFileContent] = useState<string | null>(null);

  async function handleSearch() {
    if (!trackId.trim()) {
      setMessage("Please enter a track ID.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/frontEnd/trackRequest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch track.");
      }

      // ✅ Convert response into text
      const textData = await response.text();
      setFileContent(textData);
      setMessage("File fetched successfully!");
    } catch (err) {
      setMessage("Error fetching file.");
      console.error("Request failed:", err);
      setFileContent(null);
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <input
        type="text"
        placeholder="Enter track ID..."
        value={trackId}
        onChange={(e) => setTrackId(e.target.value)}
        className="border rounded p-2 w-80"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Fetch File
      </button>

      {message && <p className="text-green-600">{message}</p>}

      {fileContent && (
        <div className="mt-4 p-2 border rounded bg-gray-200 w-96">
          <p>
            <strong>File Content:</strong>
          </p>
          <pre className="whitespace-pre-wrap break-words">{fileContent}</pre>
        </div>
      )}
    </div>
  );
}
