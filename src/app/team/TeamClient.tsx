'use client';

import { useState, useEffect } from "react";
import { Mail, Instagram, Linkedin, Quote, Edit2, Trash2, Plus, X, Upload } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
};

export default function TeamClient({ initialTeam }: { initialTeam: TeamMember[] }) {
  const [team, setTeam] = useState(initialTeam);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState<TeamMember | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deletingIdConfirm, setDeletingIdConfirm] = useState<string | null>(null);

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

  const fetchLatestTeam = async () => {
    try {
      const response = await fetch("/api/cms?type=team", { cache: "no-store" });
      if (response.ok) return (await response.json()) as TeamMember[];
    } catch (err) {
      console.error("Failed to fetch team", err);
    }
    return team;
  };

  const handleSaveTeam = async (newTeam: TeamMember[]) => {
    try {
      const response = await fetch("/api/cms?type=team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeam),
      });
      if (response.ok) {
        setTeam(newTeam);
      } else {
        const errorData = await response.json();
        alert(`Failed to save: ${errorData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Save error", err);
      alert("Network error while saving.");
    }
  };

  const handleAdd = () => {
    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      name: "New Member",
      role: "Role",
      bio: "Biography here...",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      email: "",
      instagram: "",
      linkedin: "",
    };
    setIsEditing(newMember);
  };

  const handleDelete = async (id: string) => {
    if (isDeleting) return;
    setIsDeleting(id);
    try {
      const currentTeam = await fetchLatestTeam();
      const newTeam = currentTeam.filter((m) => m.id !== id);
      await handleSaveTeam(newTeam);
    } finally {
      setIsDeleting(null);
      setDeletingIdConfirm(null);
    }
  };

  const handleUpdate = async (member: TeamMember) => {
    const currentTeam = await fetchLatestTeam();
    const exists = currentTeam.find((m) => m.id === member.id);
    const newTeam = exists
      ? currentTeam.map((m) => (m.id === member.id ? member : m))
      : [member, ...currentTeam];
    await handleSaveTeam(newTeam);
    setIsEditing(null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isEditing) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = (await res.json()) as { success?: boolean; url?: string; error?: string; details?: string };
      if (res.ok && data.success && data.url) {
        setIsEditing({ ...isEditing, photo: data.url });
      } else {
        const msg = [data.error, data.details].filter(Boolean).join(" — ") || `Upload failed (${res.status})`;
        alert(msg);
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Network error while uploading.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <section className={`section ${styles.membersSection}`}>
        <div className="container">
          {isAdmin && (
            <div className={styles.adminHeader}>
              <button className="btn btn-primary" onClick={handleAdd}>
                <Plus size={18} /> Add Team Member
              </button>
            </div>
          )}
          <div className={styles.grid}>
            {team.map((member) => (
              <div key={member.id} className={styles.memberCard}>
                <div className={styles.photoContainer}>
                  <img src={member.photo} alt={member.name} />
                  {isAdmin && (
                    <div className={styles.adminMemberControls}>
                      <button className={styles.adminBtn} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(member); }}>
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className={`${styles.adminBtn} ${styles.delete} ${isDeleting === member.id ? styles.disabled : ""}`} 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          e.stopPropagation(); 
                          if (!isDeleting) setDeletingIdConfirm(member.id);
                        }}
                        disabled={!!isDeleting}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className={styles.content}>
                  <div className={styles.role}>{member.role}</div>
                  <h2>{member.name}</h2>
                  <div className={styles.quoteIcon}>
                    <Quote size={32} strokeWidth={1} />
                  </div>
                  <p className={styles.bio}>{member.bio}</p>
                  <div className={styles.social}>
                    {member.email && <Link href={`mailto:${member.email}`}><Mail size={18} /></Link>}
                    {member.instagram && <Link href={member.instagram} target="_blank"><Instagram size={18} /></Link>}
                    {member.linkedin && <Link href={member.linkedin} target="_blank"><Linkedin size={18} /></Link>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isEditing && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{team.find(m => m.id === isEditing.id) ? "Edit Member" : "Add Member"}</h3>
              <button onClick={() => setIsEditing(null)}><X size={24} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label>Name</label>
                <input
                  value={isEditing.name}
                  onChange={(e) => setIsEditing({ ...isEditing, name: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>Role</label>
                <input
                  value={isEditing.role}
                  onChange={(e) => setIsEditing({ ...isEditing, role: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>Photo</label>
                <div className={styles.photoField}>
                  <input
                    value={isEditing.photo}
                    onChange={(e) => setIsEditing({ ...isEditing, photo: e.target.value })}
                    placeholder="Photo URL"
                  />
                  <label className={styles.uploadBtn}>
                    <Upload size={16} />
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                    {isUploading ? "..." : "Upload"}
                  </label>
                </div>
              </div>
              <div className={styles.field}>
                <label>Biography</label>
                <textarea
                  value={isEditing.bio}
                  onChange={(e) => setIsEditing({ ...isEditing, bio: e.target.value })}
                  rows={4}
                />
              </div>
              <div className={styles.socialEditGrid}>
                <div className={styles.field}>
                  <label>Email</label>
                  <input
                    value={isEditing.email ?? ""}
                    onChange={(e) => setIsEditing({ ...isEditing, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className={styles.field}>
                  <label>Instagram URL</label>
                  <input
                    value={isEditing.instagram ?? ""}
                    onChange={(e) => setIsEditing({ ...isEditing, instagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className={styles.field}>
                  <label>LinkedIn URL</label>
                  <input
                    value={isEditing.linkedin ?? ""}
                    onChange={(e) => setIsEditing({ ...isEditing, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className="btn btn-outline" onClick={() => setIsEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleUpdate(isEditing)}>Save Member</button>
            </div>
          </div>
        </div>
      )}
      {deletingIdConfirm && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.confirmModal}`}>
            <div className={styles.modalHeader}>
              <h3>Remove Team Member</h3>
              <button onClick={() => setDeletingIdConfirm(null)}><X size={24} /></button>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to remove <strong>{team.find(m => m.id === deletingIdConfirm)?.name}</strong> from the team?</p>
              <p style={{ color: "#ef4444", fontSize: "0.9rem", marginTop: "0.5rem" }}>This action cannot be undone.</p>
            </div>
            <div className={styles.modalFooter}>
              <button className="btn btn-outline" onClick={() => setDeletingIdConfirm(null)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                style={{ background: "#ef4444", borderColor: "#ef4444" }}
                onClick={() => handleDelete(deletingIdConfirm)}
              >
                {isDeleting ? "Removing..." : "Yes, Remove Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
