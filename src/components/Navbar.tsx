'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from 'next/navigation';
import styles from "./Navbar.module.css";
import { Play, Menu, User, Settings, LogOut } from "lucide-react";


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [pathname]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Fade away when scrolling away from absolute top
      if (currentScrollY > 100) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Show if cursor gets close to the top (within 100px)
      if (e.clientY < 100) {
        setIsNavVisible(true);
      } else if (window.scrollY > 100) {
        // Only hide if we are also scrolled down
        setIsNavVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);


  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };


  return (

    <nav className={`${styles.nav} ${!isNavVisible ? styles.hidden : ''}`}>

      <div className={`container ${styles.container}`}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/logo.png" 
            alt="Aurora's Eye" 
            width={110} 
            height={110} 
            className={styles.logoImage}
          />

        </Link>

        <div className={`${styles.links} ${isOpen ? styles.active : ''}`}>
          <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/documentaries" onClick={() => setIsOpen(false)}>Documentaries</Link>
          <Link href="/team" onClick={() => setIsOpen(false)}>Our Team</Link>
          <Link href="/news" onClick={() => setIsOpen(false)}>News</Link>
          <Link href="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
        </div>

        <div className={styles.actions}>
          {user ? (
            <div className={styles.userSection}>
              {user.role === 'admin' && (
                <Link href="/admin" className={styles.adminNavLink} title="Go to Dashboard">
                  <Settings size={18} />
                  <span>Admin</span>
                </Link>
              )}
              <span className={styles.userName}>{user.email.split('@')[0]}</span>
              <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (

            <Link href="/login" className="btn btn-outline" onClick={() => setIsOpen(false)}>
              <User size={18} />
              <span>Login</span>
            </Link>
          )}
          <div className={styles.menuToggle} onClick={() => setIsOpen(!isOpen)}>
            <Menu size={24} />
          </div>
        </div>

      </div>
    </nav>
  );
}

