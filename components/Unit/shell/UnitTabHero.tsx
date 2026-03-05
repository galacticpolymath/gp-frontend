import React from 'react';
import styles from '../styles/UnitHero.module.css';

type TUnitTabHeroProps = {
  id?: string;
  eyebrow: string;
  title: string;
  lead: string;
  isCredits?: boolean;
  handleShare: () => void;
};

const UnitTabHero: React.FC<TUnitTabHeroProps> = ({
  id,
  eyebrow,
  title,
  lead,
  isCredits = false,
  handleShare,
}) => (
  <section id={id} className={isCredits ? `${styles.unitTabHero} ${styles.unitTabHeroCredits}` : styles.unitTabHero}>
    <div className={styles.unitTabHeroContent}>
      <p className={styles.unitTabHeroEyebrow}>{eyebrow}</p>
      <h2 className={styles.unitTabHeroTitle}>{title}</h2>
      <p className={styles.unitTabHeroLead}>{lead}</p>
    </div>
    <div className={styles.unitHeroShareRow}>
      <button className={styles.unitMainShareAction} type="button" onClick={handleShare}>
        <i className="bi bi-share" aria-hidden="true" />
        Share
      </button>
    </div>
  </section>
);

export default UnitTabHero;
