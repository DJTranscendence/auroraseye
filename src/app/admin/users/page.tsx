'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { Users, Shield, Trash2, Mail, Calendar, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  const toggleRole = async (userId: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, role: u.role === 'admin' ? 'user' : 'admin' };
      }
      return u;
    });
    
    await fetch('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(updatedUsers),
    });
    setUsers(updatedUsers);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const updatedUsers = users.filter(u => u.id !== userId);
    await fetch('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(updatedUsers),
    });
    setUsers(updatedUsers);
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.titleInfo}>
              <Users size={32} className="text-primary" />
              <div>
                <h1>User Management</h1>
                <p>Manage community accounts and assign administrator roles.</p>
              </div>
            </div>
            <Link href="/admin" className="btn btn-outline">
              <ArrowLeft size={18} /> Back to Dashboard
            </Link>
          </div>

          <div className={styles.controls}>
            <div className={styles.searchBar}>
              <Search size={20} />
              <input 
                placeholder="Search users by email..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.stats}>
              <span>Total Users: <strong>{users.length}</strong></span>
              <span>Admins: <strong>{users.filter(u => u.role === 'admin').length}</strong></span>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User / Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4}>Loading users...</td></tr>
                ) : filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                          {user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <strong>{user.email}</strong>
                          <span>ID: {user.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select 
                        className={`${styles.roleSelect} ${user.role === 'admin' ? styles.admin : styles.user}`}
                        value={user.role}
                        onChange={(e) => toggleRole(user.id)}
                        disabled={user.email === 'admin@auroraseyefilms.com'}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={styles.statusActive}>Active</span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {user.email !== 'admin@auroraseyefilms.com' && (
                          <button 
                            onClick={() => deleteUser(user.id)} 
                            className={styles.deleteBtn}
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
