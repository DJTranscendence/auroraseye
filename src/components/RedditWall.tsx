'use client';

import React from 'react';
import RedditEmbed from './RedditEmbed';
import styles from './RedditWall.module.css';

export type RedditWallPost = { url: string };

export const AURORAS_EYE_REDDIT = 'https://www.reddit.com/r/AurorasEyeFilms/';

/** Matrimandir & I threads on r/AurorasEyeFilms (for /matrimandir-and-i). */
export const MATRIMANDIR_AND_I_REDDIT_POSTS: RedditWallPost[] = [
  { url: 'https://www.reddit.com/r/AurorasEyeFilms/comments/1rke5un/matrimandir_i_episode_5_a_temple_beyond_religion/' },
  { url: 'https://www.reddit.com/r/AurorasEyeFilms/comments/1qup81y/matrimandir_i_first_visit_it_was_a_blast_of/' },
  { url: 'https://www.reddit.com/r/AurorasEyeFilms/comments/1qjkjcg/youtube_trailer_matrimandir_i_ep_5_a_temple_with/' },
  { url: 'https://www.reddit.com/r/AurorasEyeFilms/comments/1qdgmms/youtube_matrimandir_i_ep_4_from_birth_to_old_age/' },
  { url: 'https://www.reddit.com/r/AurorasEyeFilms/comments/1owuc3k/matrimandir_i_ep_2_different_ages_one_connection/' },
  { url: 'https://www.reddit.com/r/AurorasEyeFilms/comments/1oe0w8k/matrimandir_i_ep_1_four_people_from_four_corners/' },
];

export type RedditWallProps = {
  posts?: RedditWallPost[];
  eyebrow?: string;
  heading?: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
  sectionClassName?: string;
};

/**
 * r/AurorasEyeFilms threads chosen to showcase the full channel — not only Matrimandir & I
 * (MM&I often dominates “hot”, which made this wall look like the old MM&I-only feed).
 */
const REDDIT_POSTS = [
  {
    id: 'post1',
    url: 'https://www.reddit.com/r/AurorasEyeFilms/comments/1rke6bl/compost_mentis_behind_the_scenes_of_an_ecotheatre/',
  },
  {
    id: 'post2',
    url: 'https://www.reddit.com/r/AurorasEyeFilms/comments/1phaam1/youtube_the_karsha_nuns_journey_a_quiet/',
  },
  {
    id: 'post3',
    url: 'https://www.reddit.com/r/AurorasEyeFilms/comments/1oqmrzt/a_heartfelt_tribute_zanskar_rainbow_school/',
  },
  {
    id: 'post4',
    url: 'https://www.reddit.com/r/AurorasEyeFilms/comments/1on8lww/vanishing_shores_why_sri_ma_beach_is_disappearing/',
  },
  {
    id: 'post5',
    url: 'https://www.reddit.com/r/AurorasEyeFilms/comments/1o2vcj4/from_ladakh_to_auroville_the_inspiring_journey_of/',
  },
  {
    id: 'post6',
    url: 'https://www.reddit.com/r/AurorasEyeFilms/comments/1l8oudr/dalai_lamas_urgent_message_to_humanity_universal/',
  },
];

const DEFAULT_DESCRIPTION =
  'Follow trailers, premieres, and behind-the-scenes threads from our documentaries — join the conversation on r/AurorasEyeFilms.';

export default function RedditWall({
  posts = REDDIT_POSTS,
  eyebrow = 'Community Pulse',
  heading = "Aurora's Eye Films on Reddit",
  description = DEFAULT_DESCRIPTION,
  ctaHref = AURORAS_EYE_REDDIT,
  ctaLabel = 'Visit r/AurorasEyeFilms',
  sectionClassName,
}: RedditWallProps) {
  return (
    <section className={[styles.section, sectionClassName].filter(Boolean).join(' ')}>
      <div className="container">
        <div className={styles.intro}>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{heading}</h2>
          <p>{description}</p>
          <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={styles.redditBtn}>
            {ctaLabel}
          </a>
        </div>

        <div className={styles.wallContainer}>
          {posts.map((post) => (
            <RedditEmbed key={post.url} url={post.url} />
          ))}
        </div>
      </div>
    </section>
  );
}
