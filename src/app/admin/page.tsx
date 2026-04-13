import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminPageThemeDock from "./AdminPageThemeDock";
import styles from "./page.module.css";
import { Plus, Edit, Trash2, ArrowLeft, LayoutDashboard, Film, Users, Mail, Shield, Settings, HandCoins, Newspaper, Send } from "lucide-react";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

async function getCollectionCount(fileName: string) {
  try {
    const filePath = path.join(process.cwd(), "src", "data", fileName);
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export default async function AdminDashboard() {
  const [filmsCount, teamCount, mailingListCount] = await Promise.all([
    getCollectionCount("films.json"),
    getCollectionCount("team.json"),
    getCollectionCount("newsletter.json"),
  ]);

  return (
    <>
      <Navbar />
      <AdminPageThemeDock>
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
              <Link href="/admin/films" className={styles.statCard}>
                <Film size={24} />
                <div>
                  <h3>{filmsCount}</h3>
                  <p>Films in Catalog</p>
                </div>
              </Link>
              <Link href="/admin/team" className={styles.statCard}>
                <Users size={24} />
                <div>
                  <h3>{teamCount}</h3>
                  <p>Team Members</p>
                </div>
              </Link>
              <Link href="/admin/mailing-list" className={styles.statCard}>
                <Mail size={24} />
                <div>
                  <h3>{mailingListCount}</h3>
                  <p>Mailing List Signups</p>
                </div>
              </Link>
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
                  <Link href="/admin/donations" className={styles.navItem}>
                    <HandCoins size={20} /> <span>Donations</span>
                  </Link>
                  <Link href="/admin/donations/projects" className={styles.navItem}>
                    <HandCoins size={20} /> <span>Donation Projects</span>
                  </Link>
                  <Link href="/admin/news" className={styles.navItem}>
                    <Newspaper size={20} /> <span>News</span>
                  </Link>
                  <Link href="/admin/newsletter" className={styles.navItem}>
                    <Send size={20} /> <span>Newsletter</span>
                  </Link>
                  <Link href="/admin/karsha-nuns" className={styles.navItem}>
                    <Film size={20} /> <span>Karsha Nuns</span>
                  </Link>
                  <Link href="/admin/breaking-the-silence" className={styles.navItem}>
                    <Film size={20} /> <span>Breaking the Silence</span>
                  </Link>
                  <Link href="/admin/mailing-list" className={styles.navItem}>
                    <Mail size={20} /> <span>Mailing List</span>
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
              <Link href="/admin/donations" className={styles.actionCard}>
                <HandCoins />
                <span>Donations</span>
              </Link>
              <Link href="/admin/donations/projects" className={styles.actionCard}>
                <HandCoins />
                <span>Donation Projects</span>
              </Link>
              <Link href="/admin/news" className={styles.actionCard}>
                <Newspaper />
                <span>News</span>
              </Link>
              <Link href="/admin/newsletter" className={styles.actionCard}>
                <Send />
                <span>Newsletter</span>
              </Link>
              <Link href="/admin/karsha-nuns" className={styles.actionCard}>
                <Film />
                <span>Karsha Nuns</span>
              </Link>
              <Link href="/admin/breaking-the-silence" className={styles.actionCard}>
                <Film />
                <span>Breaking the Silence</span>
              </Link>
              <Link href="/admin/mailing-list" className={styles.actionCard}>
                <Mail />
                <span>Mailing List</span>
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
      </AdminPageThemeDock>
      <Footer />
    </>
  );
}
