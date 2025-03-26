import { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(`Upload successful! File available at: ${result.filePath}`);
      } else {
        setMessage("Upload failed. " + result.message);
      }
    } catch (error) {
      setMessage("Error uploading file.");
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold">Upload a .txt File</h1>
      <input type="file" accept=".txt" onChange={handleFileChange} className="mt-4" />
      <button
        onClick={handleUpload}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Upload
      </button>
      {message && <p className="mt-4 text-lg">{message}</p>}
    </div>
  );
}
