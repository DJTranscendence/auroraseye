'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { Plus, Edit, Trash2, Save, X, Film, Search } from "lucide-react";
import Link from "next/link";

export default function ManageFilms() {
  const [films, setFilms] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cms?type=films')
      .then(res => res.json())
      .then(data => {
        setFilms(data);
        setLoading(false);
      });
  }, []);

  const handleEdit = (film: any) => {
    setIsEditing(film.id);
    setEditForm({ ...film });
  };

  const handleSave = async () => {
    const updatedFilms = films.map(f => f.id === editForm.id ? editForm : f);
    if (!films.find(f => f.id === editForm.id)) {
      updatedFilms.push({ ...editForm, id: Date.now().toString() });
    }
    
    await fetch('/api/cms?type=films', {
      method: 'POST',
      body: JSON.stringify(updatedFilms),
    });
    
    setFilms(updatedFilms);
    setIsEditing(null);
  };

  const handleDelete = async (id: string) => {
    const updatedFilms = films.filter(f => f.id !== id);
    await fetch('/api/cms?type=films', {
      method: 'POST',
      body: JSON.stringify(updatedFilms),
    });
    setFilms(updatedFilms);
  };

  const handleAddNew = () => {
    setIsEditing('new');
    setEditForm({
      title: '',
      category: '',
      year: new Date().getFullYear().toString(),
      thumbnail: '',
      description: '',
      videoUrl: ''
    });
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.titleInfo}>
              <Film size={32} className="text-primary" />
              <div>
                <h1>Manage Film Catalog</h1>
                <p>Add, edit, or remove films from your public documentary collection.</p>
              </div>
            </div>
            <div className={styles.actions}>
              <Link href="/admin" className="btn btn-outline">Back to Dashboard</Link>
              <button onClick={handleAddNew} className="btn btn-primary">
                <Plus size={18} /> Add New Film
              </button>
            </div>
          </div>

          {isEditing && (
            <div className={styles.editOverlay}>
              <div className={styles.editModal}>
                <h2>{isEditing === 'new' ? 'Add New Film' : 'Edit Film'}</h2>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Title</label>
                    <input 
                      value={editForm.title} 
                      onChange={e => setEditForm({...editForm, title: e.target.value})}
                      placeholder="e.g. Matrimandir and I"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Category</label>
                    <input 
                      value={editForm.category} 
                      onChange={e => setEditForm({...editForm, category: e.target.value})}
                      placeholder="e.g. Auroville"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Year</label>
                    <input 
                      value={editForm.year} 
                      onChange={e => setEditForm({...editForm, year: e.target.value})}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Thumbnail URL</label>
                    <input 
                      value={editForm.thumbnail} 
                      onChange={e => setEditForm({...editForm, thumbnail: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <label>Description</label>
                    <textarea 
                      value={editForm.description} 
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <label>Video URL (YouTube)</label>
                    <input 
                      value={editForm.videoUrl} 
                      onChange={e => setEditForm({...editForm, videoUrl: e.target.value})}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button onClick={() => setIsEditing(null)} className="btn btn-outline">
                    <X size={18} /> Cancel
                  </button>
                  <button onClick={handleSave} className="btn btn-primary">
                    <Save size={18} /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <div className={styles.searchWrapper}>
                <Search size={18} />
                <input type="text" placeholder="Search catalog..." />
              </div>
            </div>
            <div className={styles.tableWrapper}>
              <div className={styles.rowHeader}>
                <span>Thumbnail</span>
                <span>Title</span>
                <span>Category</span>
                <span>Year</span>
                <span>Actions</span>
              </div>

              <div className={styles.rowList}>
                {loading ? (
                  <div className={styles.empty}>Loading catalog...</div>
                ) : films.length === 0 ? (
                  <div className={styles.empty}>No films found. Click "Add New Film" to start.</div>
                ) : films.map(film => (
                  <div key={film.id} className={styles.rowCard}>
                    <div className={styles.rowThumb}>
                      <img src={film.thumbnail} alt={film.title} />
                    </div>
                    <div className={styles.rowTitle}>
                      <strong>{film.title}</strong>
                      <p>{film.description?.substring(0, 60)}...</p>
                    </div>
                    <div className={styles.rowCategory}>
                      <span className={styles.badge}>{film.category}</span>
                    </div>
                    <div className={styles.rowYear}>{film.year}</div>
                    <div className={styles.rowActions}>
                      <button onClick={() => handleEdit(film)} title="Edit"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(film.id)} title="Delete" className={styles.deleteBtn}><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
