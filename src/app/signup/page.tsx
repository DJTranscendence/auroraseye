'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { User, Mail, Lock, ArrowRight, CheckCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } else {
      alert(data.error || "Signup failed");
    }
  };

  if (success) {
    return (
      <div className={styles.successContainer}>
        <CheckCircle size={64} className="text-primary" />
        <h1>Account Created!</h1>
        <p>Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.signupContainer}>
          <div className={styles.signupCard}>
            <div className={styles.header}>
              <div className={styles.iconBox}>
                <User size={32} />
              </div>
              <h1>Create Account</h1>
              <p>Join the Aurora&apos;s Eye community and stay connected.</p>
            </div>

            <form className={styles.form} onSubmit={handleSignup}>
              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail size={20} className={styles.inputIcon} />
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
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

              <div className={styles.inputGroup}>
                <label>Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={20} className={styles.inputIcon} />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required 
                  />
                  <button 
                    type="button" 
                    className={styles.togglePassword}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>


              <button type="submit" disabled={loading} className="btn btn-primary btn-full">
                {loading ? "Creating..." : "Sign Up"} <ArrowRight size={18} />
              </button>
            </form>

            <div className={styles.footer}>
              <p>Already have an account? <Link href="/login">Sign In</Link></p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
