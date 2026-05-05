'use client';

import { useCallback, useEffect, useRef, useState, type ElementType } from 'react';
import { Pencil, Trash2, Upload } from 'lucide-react';
import { setByPath, type JsonPathSegment } from '@/lib/cms-json-path';
import styles from './InlineCmsBlocks.module.css';

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (raw) {
        const user = JSON.parse(raw) as { role?: string };
        setIsAdmin(user?.role === 'admin');
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);
  return isAdmin;
}

async function fetchCmsRoot(cmsType: string): Promise<Record<string, unknown>> {
  const res = await fetch(`/api/cms?type=${encodeURIComponent(cmsType)}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`CMS read failed (${res.status})`);
  }
  const data = await res.json();
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid CMS payload');
  }
  return data as Record<string, unknown>;
}

async function postCms(cmsType: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/cms?type=${encodeURIComponent(cmsType)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `Save failed (${res.status})`);
  }
}

type InlineCmsTextProps = {
  cmsType: string;
  path: JsonPathSegment[];
  initialValue: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
  /** Called after successful save with the new string */
  onSaved?: (next: string) => void;
};

export function InlineCmsText({
  cmsType,
  path,
  initialValue,
  as: Tag = 'span',
  className = '',
  multiline,
  onSaved,
}: InlineCmsTextProps) {
  const isAdmin = useIsAdmin();
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const openEdit = () => {
    setDraft(value);
    setError('');
    dialogRef.current?.showModal();
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const root = await fetchCmsRoot(cmsType);
      const nextRoot = setByPath(root, path, draft);
      await postCms(cmsType, nextRoot);
      setValue(draft);
      onSaved?.(draft);
      dialogRef.current?.close();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    if (multiline && (Tag === 'p' || Tag === 'div')) {
      return (
        <Tag className={className} style={{ whiteSpace: 'pre-wrap' }}>
          {value}
        </Tag>
      );
    }
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <>
      <div className={`${styles.editableInner} ${styles.adminOutline}`}>
        <span className={styles.toolbar}>
          <button type="button" className={styles.iconBtn} aria-label="Edit text" onClick={openEdit}>
            <Pencil size={14} />
          </button>
        </span>
        {multiline && (Tag === 'p' || Tag === 'div') ? (
          <Tag className={className} style={{ whiteSpace: 'pre-wrap' }}>
            {value}
          </Tag>
        ) : (
          <Tag className={className}>{value}</Tag>
        )}
      </div>

      <dialog ref={dialogRef} className={styles.dialog}>
        <div className={styles.dialogBody}>
          <p className={styles.dialogTitle}>Edit on-page copy</p>
          <textarea className={styles.textarea} value={draft} onChange={(e) => setDraft(e.target.value)} rows={multiline ? 8 : 3} />
          {error ? <p className={styles.msg}>{error}</p> : null}
          <div className={styles.dialogActions}>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => dialogRef.current?.close()}>
              Cancel
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving} onClick={() => void save()}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

type InlineCmsImageProps = {
  cmsType: string;
  path: JsonPathSegment[];
  initialSrc: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  onSaved?: (next: string) => void;
};

export function InlineCmsImage({ cmsType, path, initialSrc, alt, className = '', imgClassName = '', onSaved }: InlineCmsImageProps) {
  const isAdmin = useIsAdmin();
  const [src, setSrc] = useState(initialSrc);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSrc(initialSrc);
  }, [initialSrc]);

  const persistUrl = useCallback(
    async (nextUrl: string) => {
      const root = await fetchCmsRoot(cmsType);
      const nextRoot = setByPath(root, path, nextUrl);
      await postCms(cmsType, nextRoot);
      setSrc(nextUrl);
      onSaved?.(nextUrl);
    },
    [cmsType, path, onSaved],
  );

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = (await res.json()) as { success?: boolean; url?: string; error?: string };
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || `Upload failed (${res.status})`);
      }
      await persistUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const clearImage = async () => {
    if (!confirm('Remove this image from the page?')) return;
    setBusy(true);
    setError('');
    try {
      await persistUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed');
    } finally {
      setBusy(false);
    }
  };

  const show = src && src.trim().length > 0;

  if (!isAdmin) {
    return show ? (
      <span className={className}>
        <img src={src} alt={alt} className={imgClassName} />
      </span>
    ) : null;
  }

  return (
    <span className={`${styles.imageWrap} ${className}`}>
      {show ? <img src={src} alt={alt} className={imgClassName} /> : <span className={imgClassName} style={{ opacity: 0.5 }}>No image</span>}
      <span className={styles.imageToolbar}>
        <button type="button" className={styles.iconBtn} aria-label="Upload image" disabled={busy} onClick={() => fileRef.current?.click()}>
          <Upload size={14} />
        </button>
        {show ? (
          <button type="button" className={`${styles.iconBtn} ${styles.iconBtnDanger}`} aria-label="Delete image" disabled={busy} onClick={() => void clearImage()}>
            <Trash2 size={14} />
          </button>
        ) : null}
      </span>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(ev) => void onPickFile(ev)} />
      {error ? <p className={styles.msg}>{error}</p> : null}
      {busy ? <p className={styles.msg}>Working…</p> : null}
    </span>
  );
}
