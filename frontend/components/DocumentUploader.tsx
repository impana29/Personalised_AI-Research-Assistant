import React, { useState, ChangeEvent } from "react";

interface UploadResult {
  session_id: string;
  summary: string;
  document: string;
}

interface DocumentUploaderProps {
  onUpload: (result: UploadResult) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      onUpload(data);
    } catch (error) {
      console.error("Upload error", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border p-4 rounded-md">
      <input type="file" onChange={handleFileChange} className="w-full mb-4" />
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {uploading ? "Uploading..." : "Upload Document"}
      </button>
    </div>
  );
};

export default DocumentUploader;
