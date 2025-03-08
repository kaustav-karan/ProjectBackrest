"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";

require("dotenv").config(); // Load environment variables

let socket: Socket;

export default function SearchFile() {
  const [trackId, settrackId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [socketMessage, setSocketMessage] = useState<string>("");

  useEffect(() => {
    // Establish WebSocket connection
    socket = io("http://localhost:3001", {
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("WebSocket Connected:", socket.id);
      setSocketMessage("Connected to WebSocket!");
    });

    socket.on("connect_error", (err: Error) => {
      console.error("WebSocket Connection Error:", err);
      setSocketMessage("WebSocket Connection Error!");
    });

    socket.on("message", (data: string) => {
      console.log("Message from backend:", data);
      setSocketMessage(`Backend: ${data}`);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket Disconnected");
      setSocketMessage("WebSocket Disconnected!");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSearch = async () => {
    if (!trackId.trim()) {
      setMessage("Please enter a track ID.");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:3001/get-file`, {
        trackId,
      });

      if (response.data.file) {
        setMessage("File fetched successfully!");

        // Decode Base64 to text and set state
        const decodedText = atob(response.data.file);
        setFileContent(decodedText);

        // Send WebSocket event to notify backend
        socket.emit("file-fetched", { trackId });
      } else {
        setMessage("File not found.");
        setFileContent(null);
      }
    } catch (err) {
      setMessage("Error fetching file.");
      console.error("Request failed:", err);
      setFileContent(null);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <p className="text-gray-600">{socketMessage}</p>

      <input
        type="text"
        placeholder="Enter track ID..."
        value={trackId}
        onChange={(e) => settrackId(e.target.value)}
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
