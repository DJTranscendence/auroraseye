'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { ArrowLeft, Download, Mail, Search } from 'lucide-react';

type Subscriber = {
  email: string;
  subscribedAt: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function AdminMailingListPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/newsletter')
      .then((response) => response.json())
      .then((data) => setSubscribers(Array.isArray(data) ? data : []))
      .catch(() => setSubscribers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      subscribers.filter((subscriber) =>
        subscriber.email.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [search, subscribers],
  );

  const downloadCsv = () => {
    const rows = [['email', 'subscribedAt'], ...filtered.map((entry) => [entry.email, entry.subscribedAt])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `auroras-eye-mailing-list-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <header className={styles.header}>
            <div className={styles.titleInfo}>
              <Mail size={30} className="text-primary" />
              <div>
                <h1>Mailing List Viewer</h1>
                <p>Browse subscribers and export the list for campaign delivery tools.</p>
              </div>
            </div>
            <div className={styles.actions}>
              <Link href="/admin" className="btn btn-outline">
                <ArrowLeft size={16} /> Back to Dashboard
              </Link>
              <button type="button" className="btn btn-primary" onClick={downloadCsv}>
                <Download size={16} /> Download CSV
              </button>
            </div>
          </header>

          <div className={styles.controls}>
            <div className={styles.searchBar}>
              <Search size={18} />
              <input
                placeholder="Search by email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className={styles.stats}>
              <span>
                Total: <strong>{subscribers.length}</strong>
              </span>
              <span>
                Visible: <strong>{filtered.length}</strong>
              </span>
            </div>
          </div>

          <section className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Subscribed At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={2} className={styles.empty}>
                      Loading subscribers...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={2} className={styles.empty}>
                      No subscribers found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((subscriber) => (
                    <tr key={`${subscriber.email}-${subscriber.subscribedAt}`}>
                      <td className={styles.email}>{subscriber.email}</td>
                      <td className={styles.time}>{formatDate(subscriber.subscribedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
