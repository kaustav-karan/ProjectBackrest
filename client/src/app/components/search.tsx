'use client'

import { useState } from "react";
import axios from "axios";

const SERVER_IP = "http://localhost:5000"; // Change to actual server IP

export default function SearchFile() {
    const [filename, setFilename] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [downloadLink, setDownloadLink] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!filename.trim()) {
            setMessage("Please enter a filename.");
            return;
        }

        try {
            const response = await axios.post(`${SERVER_IP}/get-file`, 
                { filename }, 
                { responseType: "blob" }
            );

            // Create a download link for the received file
            const blob = new Blob([response.data]);
            const fileURL = URL.createObjectURL(blob);
            setDownloadLink(fileURL);

            setMessage(`File "${filename}" is ready for download.`);
        } catch (err) {
            setMessage("file not found");
            setDownloadLink(null);
            console.error("Request failed:", err);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4 p-4">
            <input
                type="text"
                placeholder="Enter filename..."
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="border rounded p-2 w-80"
            />
            <button
                onClick={handleSearch}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Request File
            </button>
            {message && <p>{message}</p>}
            {downloadLink && (
                <a
                    href={downloadLink}
                    download={filename}
                    className="text-blue-600 underline"
                >
                    Download {filename}
                </a>
            )}
        </div>
    );
}
