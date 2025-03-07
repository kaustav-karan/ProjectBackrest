import { useState } from "react";
import axios from "axios";

export default function Publish() {
  const [file, setFile] = useState<File | null>(null);
  const [publisherName, setPublisherName] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!file || !publisherName) {
      setMessage("Please select a file and enter publisher name.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("size", file.size.toString());
    formData.append("publisher_name", publisherName);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData);

      if (response.status === 200) {
        setMessage(`Upload successful! File available at: ${response.data.filePath}`);
      } else {
        setMessage("Upload failed. " + response.data.message);
      }
    } catch (error) {
      setMessage("Error uploading file.");
    }
  };

  return (
    <form onSubmit={handleUpload} className="flex flex-col items-center p-6">
      <label className="text-lg font-bold">Upload File</label>
      <input type="file" name="file" accept=".txt" onChange={handleFileChange} className="mt-2" />
      <input 
        type="text" 
        placeholder="Enter publisher name" 
        value={publisherName} 
        onChange={(e) => setPublisherName(e.target.value)} 
        className="mt-2 p-2 border rounded"
      />
      <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Upload</button>
      {message && <p className="mt-4 text-lg">{message}</p>}
    </form>
  );
}