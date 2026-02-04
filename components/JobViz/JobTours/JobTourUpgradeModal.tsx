import React from "react";
import { Modal, Button } from "react-bootstrap";
import Link from "next/link";
import styles from "../../../styles/jobvizBurst.module.scss";

interface JobTourUpgradeModalProps {
  show: boolean;
  onClose: () => void;
}

const JobTourUpgradeModal: React.FC<JobTourUpgradeModalProps> = ({
  show,
  onClose,
}) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      contentClassName={styles.jobvizUpgradeModal}
    >
      <div className={styles.jobvizUpgradeBody}>
        <div className={styles.jobvizUpgradeHeader}>
          <p className={styles.jobvizUpgradeKicker}>JobViz+ Tours</p>
          <h2>Copy and edit tours with GP+</h2>
          <p>
            GP+ lets you customize JobViz tours, build assignments from scratch,
            and save them for your classes.
          </p>
        </div>
        <div className={styles.jobvizUpgradeActions}>
          <a
            href="https://www.galacticpolymath.com/plus"
            target="_blank"
            rel="noreferrer"
            className={styles.jobvizUpgradeGhost}
          >
            Learn More
          </a>
          <Link href="/gp-plus" className={styles.jobvizUpgradePrimary}>
            Get GP+
          </Link>
        </div>
        <Button
          variant="link"
          onClick={onClose}
          className={styles.jobvizUpgradeClose}
        >
          Not now
        </Button>
      </div>
    </Modal>
  );
};

export default JobTourUpgradeModal;
