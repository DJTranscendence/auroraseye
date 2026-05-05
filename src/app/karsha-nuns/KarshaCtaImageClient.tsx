'use client';

import { useState, useEffect } from "react";
import styles from "./page.module.css";

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!data?.success) {
    throw new Error(data?.error || "Upload failed");
  }

  return data.url as string;
}

export default function KarshaCtaImageClient({ 
  initialImageUrl,
  initialData 
}: { 
  initialImageUrl: string;
  initialData: any;
}) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        setIsAdmin(user?.role === "admin");
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const uploadedUrl = await uploadFile(file);
      
      // Fetch latest data to merge
      const res = await fetch("/api/cms?type=karshaNuns", { cache: "no-store" });
      const currentData = res.ok ? await res.json() : initialData;
      
      const nextData = {
        ...currentData,
        discussionCtaImage: uploadedUrl,
      };

      const saveResponse = await fetch("/api/cms?type=karshaNuns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextData),
      });

      if (saveResponse.ok) {
        setImageUrl(uploadedUrl);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
      if (input) input.value = "";
    }
  };

  return (
    <div className={styles.ctaImageWrapper} style={{ position: 'relative' }}>
      <img src={imageUrl} alt="Join the conversation" className={styles.ctaImage} />
      {isAdmin && (
        <div className={styles.adminCtaUploadOverlay}>
          <input
            id="karsha-cta-upload"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
          <label htmlFor="karsha-cta-upload" className={styles.adminUploadButton}>
            {isUploading ? "..." : "Edit Image"}
          </label>
        </div>
      )}
    </div>
  );
}
