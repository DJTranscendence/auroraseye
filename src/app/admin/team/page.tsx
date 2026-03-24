'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { Plus, Edit, Trash2, Save, X, Users, Mail } from "lucide-react";
import Link from "next/link";

export default function ManageTeam() {
  const [team, setTeam] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cms?type=team')
      .then(res => res.json())
      .then(data => {
        setTeam(data);
        setLoading(false);
      });
  }, []);

  const handleEdit = (member: any) => {
    setIsEditing(member.id);
    setEditForm({ ...member });
  };

  const handleSave = async () => {
    const updatedTeam = team.map(m => m.id === editForm.id ? editForm : m);
    if (!team.find(m => m.id === editForm.id)) {
      updatedTeam.push({ ...editForm, id: Date.now().toString() });
    }
    
    await fetch('/api/cms?type=team', {
      method: 'POST',
      body: JSON.stringify(updatedTeam),
    });
    
    setTeam(updatedTeam);
    setIsEditing(null);
  };

  const handleDelete = async (id: string) => {
    const updatedTeam = team.filter(m => m.id !== id);
    await fetch('/api/cms?type=team', {
      method: 'POST',
      body: JSON.stringify(updatedTeam),
    });
    setTeam(updatedTeam);
  };

  const handleAddNew = () => {
    setIsEditing('new');
    setEditForm({
      name: '',
      role: '',
      bio: '',
      photo: ''
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      setEditForm({ ...editForm, photo: data.url });
    } else {
      alert('Upload failed: ' + data.error);
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.titleInfo}>
              <Users size={32} className="text-primary" />
              <div>
                <h1>Manage Our Team</h1>
                <p>Add, edit, or remove staff profiles from the &quot;Our Team&quot; page.</p>
              </div>
            </div>
            <div className={styles.actions}>
              <Link href="/admin" className="btn btn-outline">Back to Dashboard</Link>
              <button onClick={handleAddNew} className="btn btn-primary">
                <Plus size={18} /> Add Staff Member
              </button>
            </div>
          </div>

          <div className={styles.grid}>
            {loading ? (
              <p>Loading team members...</p>
            ) : team.map((member) => (
              <div key={member.id} className={styles.memberCard}>
                <div className={styles.photo}>
                  <img src={member.photo} alt={member.name} />
                </div>
                <div className={styles.info}>
                  <h3>{member.name}</h3>
                  <p className={styles.role}>{member.role}</p>
                  <p className={styles.bioPreview}>{member.bio?.substring(0, 100)}...</p>
                  <div className={styles.cardActions}>
                    <button onClick={() => handleEdit(member)} className={styles.editBtn}>
                      <Edit size={18} /> Edit Profile
                    </button>
                    <button onClick={() => handleDelete(member.id)} className={styles.deleteBtn}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isEditing && (
            <div className={styles.editOverlay}>
              <div className={styles.editModal}>
                <div className={styles.modalHeader}>
                  <h2>{isEditing === 'new' ? 'Add Staff Member' : `Edit ${editForm.name}`}</h2>
                </div>
                
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Full Name</label>
                    <input 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Role</label>
                    <input 
                      value={editForm.role} 
                      onChange={e => setEditForm({...editForm, role: e.target.value})}
                    />
                  </div>

                  <div className={styles.fieldFull}>
                    <label>Profile Photo</label>
                    <div className={styles.uploadArea}>
                      {editForm.photo && (
                        <div className={styles.photoPreview}>
                          <img src={editForm.photo} alt="Preview" />
                        </div>
                      )}
                      <div className={styles.uploadInput}>
                        <input 
                          type="text"
                          placeholder="Or enter URL here..."
                          value={editForm.photo} 
                          onChange={e => setEditForm({...editForm, photo: e.target.value})}
                        />
                        <div className={styles.fileBtn}>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                            id="photo-upload"
                            style={{ display: 'none' }}
                          />
                          <label htmlFor="photo-upload" className="btn btn-outline">
                            Upload from Computer
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.fieldFull}>
                    <label>Biography</label>
                    <textarea 
                      value={editForm.bio} 
                      onChange={e => setEditForm({...editForm, bio: e.target.value})}
                      rows={5}
                    />
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button onClick={() => setIsEditing(null)} className="btn btn-outline">
                    <X size={18} /> Cancel
                  </button>
                  <button onClick={handleSave} className="btn btn-primary">
                    <Save size={18} /> Save Member
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

