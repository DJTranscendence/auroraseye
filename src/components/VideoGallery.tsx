'use client';

import { useState } from 'react';
import styles from './VideoGallery.module.css';
import { Play, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const PROJECTS = [
  {
    id: 1,
    title: "Karsha Nuns",
    category: "Arts",
    description: "A documentary about the lives of nuns in Zanskar. Witness their journey of empowerment and spirituality.",
    img: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2670&auto=format&fit=crop",
    video: "https://assets.mixkit.co/videos/preview/mixkit-cinematic-view-of-a-mountain-lake-4853-large.mp4",
    href: "/karsha-nuns"
  },
  {
    id: 2,
    title: "Forest Breath",
    category: "Environmental",
    description: "Documenting the re-forestation efforts across the dry tropical belt of Auroville's Green Belt.",
    img: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=2671&auto=format&fit=crop",
    video: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-dense-green-forest-4850-large.mp4",
    href: "/films/2"
  },

  {
    id: 3,
    title: "Golden Hour Spirits",
    category: "Social Experiment",
    description: "A series exploring the unique spiritual and communal life of the international township of Auroville.",
    img: "https://images.unsplash.com/photo-1460518451285-97b6aa326961?q=80&w=2670&auto=format&fit=crop",
    video: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-looking-at-the-ocean-during-golden-hour-4852-large.mp4",
    href: "/films/3"
  },
  {
    id: 4,
    title: "Eternal Dawn",
    category: "Philosophy",
    description: "Interviews with early pioneers of the City of Dawn, sharing their visions of a human unity.",
    img: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2670&auto=format&fit=crop",
    video: "https://assets.mixkit.co/videos/preview/mixkit-man-walking-on-a-dock-at-sunrise-4851-large.mp4",
    href: "/films/4"
  }
];


export default function VideoGallery() {
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <section className={styles.gallerySection}>
      <div className="container">
        <div className={styles.header}>
          <div className="badge">Project Series</div>
          <h2 className="title">Visual Narrative <span className="text-primary">Series</span></h2>
        </div>
      </div>
      
      <div className={styles.carouselContainer} onMouseLeave={() => setActiveId(null)}>
        <div className={styles.carouselTrack}>
          {PROJECTS.map((project) => (
            <div 
              key={project.id}
              className={`${styles.card} ${activeId === project.id ? styles.active : ''} ${activeId !== null && activeId !== project.id ? styles.inactive : ''}`}
              onMouseEnter={() => setActiveId(project.id)}
            >
              <div className={styles.videoWrapper}>
                <video 
                  src={project.video}
                  poster={project.img}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
              
              <div className={styles.overlay}>
                <div className={styles.content}>
                  <span className={styles.category}>{project.category}</span>
                  <h3 className={styles.cardTitle}>{project.title}</h3>
                  <div className={styles.extraInfo}>
                    <p>{project.description}</p>
                    <Link href={project.href} className={styles.playLink}>
                      <span className={styles.playIcon}><Play size={16} fill="white" /></span>
                      See Their Story
                    </Link>


                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
