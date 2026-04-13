'use client';

import styles from './page.module.css';

const TEST_VIDEO_URL = 'https://www.youtube.com/watch?v=r2VBkoDIE3g&t=20s';

export default function DocumentaryTestThumb() {
  const handleClick = () => {
    window.location.assign(TEST_VIDEO_URL);
  };

  return (
    <button type="button" className={styles.testThumbButton} onClick={handleClick}>
      <img
        src="https://img.youtube.com/vi/r2VBkoDIE3g/hqdefault.jpg"
        alt="Waste in the Himalayas"
        loading="lazy"
      />
      <span>Watch the sample film</span>
    </button>
  );
}
