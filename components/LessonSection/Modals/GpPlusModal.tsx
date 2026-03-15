import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Modal } from 'react-bootstrap';
import { GrDownload } from 'react-icons/gr';
import { FaEdit } from 'react-icons/fa';
import { FaUnlockKeyhole } from 'react-icons/fa6';
import { useModalContext } from '../../../providers/ModalProvider';
import useSiteSession from '../../../customHooks/useSiteSession';

interface GpPlusModalProps {
  onClose?: () => void;
  userStatus?: ReturnType<typeof useSiteSession>['status'];
}

const ICON_COLOR = '#14B1EA';

const GpPlusModal: React.FC<GpPlusModalProps> = ({ onClose, userStatus }) => {
  const { status: sessionStatus } = useSiteSession();
  const { _isGpPlusModalDisplayed } = useModalContext();
  const [isGpPlusModalDisplayed, setIsGpPlusModalDisplayed] = _isGpPlusModalDisplayed;

  const resolvedUserStatus = userStatus ?? sessionStatus;

  const handleOnClose = () => {
    if (onClose) {
      onClose();
    }

    setIsGpPlusModalDisplayed(false);
  };

  return (
    <Modal
      show={isGpPlusModalDisplayed}
      onHide={handleOnClose}
      centered
      className="gp-plus-modal"
      keyboard
      style={{ zIndex: 10000 }}
    >
      <div className="gp-plus-modal-gradient gp-plus-modal-top">
        <Image
          src="/imgs/gp-logos/gp_submark.png"
          alt="GP Plus Logo"
          width={88}
          height={88}
          style={{ objectFit: 'contain' }}
        />
        <h2 className="gp-plus-modal-title">Get classroom-ready files faster with GP+</h2>
      </div>
      <div className="gp-plus-modal-content">
        <p className="gp-plus-modal-description">
          Save prep time with editable lesson files, one-click Google Drive copies, and premium
          classroom workflow tools.
        </p>
        <ul className="gp-plus-modal-benefits list-unstyled">
          <li className="gp-plus-modal-benefit">
            <GrDownload color={ICON_COLOR} aria-hidden="true" />
            <span>Bulk-download complete lesson resources in one step</span>
          </li>
          <li className="gp-plus-modal-benefit">
            <FaEdit color={ICON_COLOR} aria-hidden="true" />
            <span>Customize slides, docs, and worksheets to fit your class</span>
          </li>
          <li className="gp-plus-modal-benefit">
            <FaUnlockKeyhole color={ICON_COLOR} aria-hidden="true" />
            <span>Unlock GP+ tools for faster planning and stronger engagement</span>
          </li>
        </ul>
        <section className="gp-plus-modal-actions">
          <Link href="/gp-plus" className="gp-plus-modal-cta">
            {resolvedUserStatus === 'authenticated' ? 'Upgrade to GP+' : 'Start GP+ Today'}
          </Link>
          <Link href="/gp-plus" className="gp-plus-modal-learn-more">
            See full GP+ benefits
          </Link>
        </section>
      </div>
    </Modal>
  );
};

export default GpPlusModal;
