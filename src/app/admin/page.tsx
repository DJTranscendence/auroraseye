import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { Plus, Edit, Trash2, ArrowLeft, LayoutDashboard, Film, Users, Mail, Shield, Settings } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.titleInfo}>
              <LayoutDashboard size={32} className="text-primary" />
              <div>
                <h1>Admin Dashboard</h1>
                <p>Manage your film catalog, team, and website settings.</p>
              </div>
            </div>
            <Link href="/" className="btn btn-outline">
              <ArrowLeft size={18} /> View Public Site
            </Link>
          </div>

          <div className={styles.statsOverview}>
            <div className={styles.statCard}>
              <Film size={24} />
              <div>
                <h3>4</h3>
                <p>Films in Catalog</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <Users size={24} />
              <div>
                <h3>2</h3>
                <p>Team Members</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <Mail size={24} />
              <div>
                <h3>124</h3>
                <p>Mailing List Signup</p>
              </div>
            </div>
          </div>

          <div className={styles.adminGrid}>
            <div className={styles.sidebar}>
              <nav className={styles.sideNav}>
                <Link href="/admin" className={styles.activeLink}>
                  <LayoutDashboard size={18} /> <span>Overview</span>
                </Link>
                <Link href="/admin/films" className={styles.navItem}>
                  <Film size={20} /> <span>Films Catalog</span>
                </Link>
                <Link href="/admin/team" className={styles.navItem}>
                  <Users size={20} /> <span>Team Members</span>
                </Link>
                <Link href="/admin/users" className={styles.navItem}>
                  <Shield size={20} /> <span>User Management</span>
                </Link>
                <Link href="/admin/settings" className={styles.navItem}>
                  <Settings size={20} /> <span>Site Settings</span>
                </Link>

              </nav>
            </div>
            
            <div className={styles.contentArea}>
              <div className={styles.quickActions}>
                <h2>Quick Actions</h2>
                <div className={styles.actionGrid}>
                  <Link href="/admin/films" className={styles.actionCard}>
              <Film />
              <span>Catalog</span>
            </Link>
            <Link href="/admin/team" className={styles.actionCard}>
              <Users />
              <span>Team</span>
            </Link>
            <Link href="/admin/users" className={styles.actionCard}>
              <Shield />
              <span>Users</span>
            </Link>
            <Link href="/admin/settings" className={styles.actionCard}>
              <Settings />
              <span>Settings</span>
            </Link>
                </div>
              </div>

              <div className={styles.recentActivity}>
                <h2>Recent Activity</h2>
                <div className={styles.activityTable}>
                  <div className={styles.activityRow}>
                    <div className={styles.indicator}></div>
                    <div className={styles.info}>
                      <strong>New Film Added:</strong> &quot;The Weaver&apos;s Song&quot;
                      <p>Added by Serena Aurora • 2 hours ago</p>
                    </div>
                  </div>
                  <div className={styles.activityRow}>
                    <div className={styles.indicator}></div>
                    <div className={styles.info}>
                      <strong>Updated Staff Bio:</strong> Serena Aurora
                      <p>Updated by System • 1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
