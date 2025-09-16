/* eslint-disable quotes */

import React, { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import Image from "next/image";
import Wave from "react-wavify";
import { FaCheckCircle, FaRocket, FaUsers } from "react-icons/fa";
import { BiCheckbox, BiCheckboxChecked } from "react-icons/bi";
import Link from "next/link";
import { useModalContext } from "../../providers/ModalProvider";

interface ThankYouModalProps {
  onClose?: () => void;
}

const CopyLessonHelperModal: React.FC<ThankYouModalProps> = ({ onClose }) => {
  const { _isCopyLessonHelperModalDisplayed } = useModalContext();
  const [
    isCopyLessonHelperModalDisplayed,
    setIsCopyLessonHelperModalDisplayed,
  ] = _isCopyLessonHelperModalDisplayed;
  const [dontShowModalAgain, setDontShowModalAgain] = useState(false);

  const handleDontShowAgainToggle = () => {
    const newValue = !dontShowModalAgain;
    setDontShowModalAgain(newValue);
  };

  const handleOnClose = () => {
    if (onClose) {
      onClose();
    }

    setIsCopyLessonHelperModalDisplayed(false);
  };

  return (
    <Modal
      show={isCopyLessonHelperModalDisplayed}
      onHide={handleOnClose}
      size="lg"
      centered
      className="rounded"
      keyboard={false}
      style={{
        zIndex: 10000,
      }}
    >
      <Modal.Body className="text-center p-4">
        <div className="mb-4">
          <h4 className="mb-3">About Copying A Lesson: </h4>
          <div className="mb-3">
            <p className="text-muted mb-2">
              Files will be copied to your Google drive in the following path:
            </p>
            <p className="fw-bold text-primary">
              My Drive → My GP+ Units → UNIT NAME
            </p>
          </div>

          <div className="mb-3">
            <p className="text-muted mb-2">
              Select all lesson files by drawing a box around them like this:
            </p>
            <div className="d-flex justify-content-center mt-3">
              <Image
                src="/plus/Select-FILES.gif"
                alt="How to select files by drawing a box"
                width={400}
                height={300}
                className="rounded shadow-sm"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-center">
          {dontShowModalAgain ? (
            <BiCheckboxChecked
              onClick={handleDontShowAgainToggle}
              fontSize={25}
              className="pointer"
            />
          ) : (
            <BiCheckbox
              onClick={handleDontShowAgainToggle}
              fontSize={25}
              className="pointer"
            />
          )}
          <span
            onClick={handleDontShowAgainToggle}
            className="text-muted underline-on-hover"
          >
            Don't show me this modal again
          </span>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between align-items-center flex-column">
        <Button variant="primary" onClick={handleOnClose}>
          Continue
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CopyLessonHelperModal;
