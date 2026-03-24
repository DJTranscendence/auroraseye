'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {

      alert(data.error || 'Invalid credentials.');
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.header}>
              <div className={styles.iconBox}>
                <Lock size={32} />
              </div>
              <h1>Welcome Back</h1>
              <p>Sign in to your Aurora&apos;s Eye account.</p>
            </div>

            <form className={styles.form} onSubmit={handleLogin}>
              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <div className={styles.inputWrapper}>
                  <User size={20} className={styles.inputIcon} />
                  <input 
                    type="email" 
                    placeholder="admin@auroraseyefilms.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={20} className={styles.inputIcon} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required 
                  />
                  <button 
                    type="button" 
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className={styles.options}>
                <label className={styles.remember}>
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <button type="button" className={styles.forgot}>Forgot password?</button>
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                Sign In <ArrowRight size={18} />
              </button>
            </form>

            <div className={styles.footerLink}>
              <p>Don&apos;t have an account? <Link href="/signup">Create Account</Link></p>
            </div>
          </div>
          
          <div className={styles.loginInfo}>
            <p>Admin credentials: admin@auroraseyefilms.com / admin123</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

