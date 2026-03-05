import React from 'react';
import Link from 'next/link';
import styles from '../styles/UnitOfficeUpsellModal.module.css';

type TUnitOfficeUpsellModalProps = {
  format: string;
  onClose: () => void;
};

const UnitOfficeUpsellModal: React.FC<TUnitOfficeUpsellModalProps> = ({
  format,
  onClose,
}) => (
  <div className={styles.officeUpsellModalBackdrop} role="presentation" onClick={onClose}>
    <div
      className={styles.officeUpsellModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="office-upsell-title"
      onClick={(event) => event.stopPropagation()}
    >
      <h3 id="office-upsell-title">Editable {format} files are GP+ only</h3>
      <p>
        With a GP+ subscription, you can download editable Office files for teaching
        materials and unlock the full GP+ toolkit.
      </p>
      <div className={styles.officeUpsellActions}>
        <Link href="/plus" className={styles.officeUpsellPrimary}>
          Explore GP+ Benefits
        </Link>
        <button type="button" className={styles.officeUpsellSecondary} onClick={onClose}>
          Not now
        </button>
      </div>
    </div>
  </div>
);

export default UnitOfficeUpsellModal;
