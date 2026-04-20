'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { GOOGLE_OAUTH_ERROR_MESSAGES } from '@/config/google-oauth-errors';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleError, setGoogleError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('error');
    if (code && GOOGLE_OAUTH_ERROR_MESSAGES[code]) {
      setGoogleError(GOOGLE_OAUTH_ERROR_MESSAGES[code]);
      const path = `${window.location.pathname}`;
      window.history.replaceState({}, '', path);
    }
  }, []);

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

            {googleError ? <p className={styles.googleError}>{googleError}</p> : null}

            <a className={styles.googleButton} href="/api/auth/google">
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
                <path
                  fill="#FFC107"
                  d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                />
                <path
                  fill="#FF3D00"
                  d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                />
              </svg>
              Continue with Google
            </a>

            <div className={styles.googleUpArrow} aria-hidden="true" />
            <p className={styles.googleRecommend}>
              We recommend you choose this option, so that all your likes and comments go straight to our YouTube,
              which really helps us!
            </p>

            <div className={styles.oauthDivider} aria-hidden="true">
              <span>or email</span>
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

