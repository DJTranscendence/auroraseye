'use client';

import React from 'react';
import RedditEmbed from './RedditEmbed';
import styles from './RedditWall.module.css';

const REDDIT_POSTS = [
  {
    id: 'post1',
    url: 'https://www.reddit.com/r/MatrimandirAndI/comments/1rke5cy/matrimandir_i_episode_5_a_temple_beyond_religion/',
  },
  {
    id: 'post2',
    url: 'https://www.reddit.com/r/MatrimandirAndI/comments/1qup7o6/youtube_matrimandir_i_first_visit_it_was_a_blast/',
  },
  {
    id: 'post3',
    url: 'https://www.reddit.com/r/MatrimandirAndI/comments/1qdgm8z/youtube_matrimandir_i_ep_4_from_birth_to_old_age/',
  },
  {
    id: 'post4',
    url: 'https://www.reddit.com/r/MatrimandirAndI/comments/1oe0wo0/matrimandir_i_ep_1_four_people_from_four_corners/',
  },
  {
    id: 'post5',
    url: 'https://www.reddit.com/r/MatrimandirAndI/comments/1owucg7/matrimandir_i_ep_2_different_ages_one_connection/',
  },
  {
    id: 'post6',
    url: 'https://www.reddit.com/r/MatrimandirAndI/comments/1pha9zl/youtube_matrimandir_i_53_years_of_living_an/',
  }
];

export default function RedditWall() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.intro}>
          <p className="eyebrow">Community Pulse</p>
          <h2>Matrimandir & I on Reddit</h2>
          <p>
            Join our growing community on Reddit where we share personal experiences, 
            behind-the-scenes stories, and deep dives into the soul of Auroville.
          </p>
          <a 
            href="https://www.reddit.com/r/MatrimandirAndI/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.redditBtn}
          >
            Visit r/MatrimandirAndI
          </a>
        </div>

        <div className={styles.wallContainer}>
          {REDDIT_POSTS.map(post => (
            <RedditEmbed key={post.id} url={post.url} />
          ))}
        </div>
      </div>
    </section>
  );
}
