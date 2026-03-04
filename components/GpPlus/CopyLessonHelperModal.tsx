/* eslint-disable no-alert */
 

import React, { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import Image from "next/image";
import { BiCheckbox, BiCheckboxChecked } from "react-icons/bi";
import { useModalContext } from "../../providers/ModalProvider";
import { useLessonContext } from "../../providers/LessonProvider";
import { updateUser } from "../../apiServices/user/crudFns";
import useSiteSession from "../../customHooks/useSiteSession";
import { setLocalStorageItem } from "../../shared/fns";

interface ThankYouModalProps {
  onClose?: () => void;
}

const CopyLessonHelperModal: React.FC<ThankYouModalProps> = ({ onClose }) => {
  const { _isCopyLessonHelperModalDisplayed } = useModalContext();
  const { _lessonToCopy } = useLessonContext();
  const [
    isCopyLessonHelperModalDisplayed,
    setIsCopyLessonHelperModalDisplayed,
  ] = _isCopyLessonHelperModalDisplayed;
  const { token } = useSiteSession();
  const [lessonToCopy, setLessonToCopy] = _lessonToCopy;
  const [dontShowModalAgain, setDontShowModalAgain] = useState(false);
  const [willUpdateUser, setWillUpdateUser] = useState(false);

  const handleDontShowAgainToggle = () => {
    setDontShowModalAgain((state) => {
      return !state;
    });
  };

  const handleOnHide = () => {
    if (onClose) {
      onClose();
    }

    setIsCopyLessonHelperModalDisplayed(false);
    setLessonToCopy(null);
  };

  const handleContinueBtnClick = async () => {
    if (!lessonToCopy) {
      globalThis.alert?.(
        "ERROR! Cannot determine what lesson you chose. Please refresh the page and try again."
      );
      return;
    }

    if (dontShowModalAgain) {
      setWillUpdateUser(true);
      setLocalStorageItem("willShowGpPlusCopyLessonHelperModal", false);
    }

    setIsCopyLessonHelperModalDisplayed(false);

    setTimeout(() => {
      setLessonToCopy({
        id: lessonToCopy.id,
        willOpenGDrivePicker: true,
      });
    }, 300);
  };

  useEffect(() => {
    if (willUpdateUser) {
      updateUser(
        undefined,
        { willShowGpPlusCopyLessonHelperModal: false },
        {},
        token
      )
        .then((result) => {
          console.log(
            "User update result for the 'willShowGpPlusCopyLessonHelperModal' field:",
            result
          );
        })
        .catch((result) => {
          console.error(
            "Failed to update user willShowGpPlusCopyLessonHelperModal setting:",
            result
          );
        })
        .finally(() => {
          setWillUpdateUser(false);
        });
    }
  }, [willUpdateUser]);

  return (
    <Modal
      backdropClassName="backdrop-copy-lesson-helper-modal"
      show={isCopyLessonHelperModalDisplayed}
      onHide={handleOnHide}
      size="lg"
      centered
      className="rounded"
      keyboard={false}
      style={{
        zIndex: 10000,
      }}
    >
      <Modal.Body className="text-center px-4 pt-4 pb-2">
        <div className="mb-2">
          <h4 className="mb-2">Copy lesson files to Google Drive</h4>
          <p className="text-muted mb-1">
            Destination: <span className="fw-bold text-primary">My Drive → My GP+ Units → UNIT NAME</span>
          </p>
          <p className="text-muted mb-2">
            In the picker, drag a selection box over files. Shift/Cmd/Ctrl-click also works.
          </p>
          <div className="d-flex justify-content-center mt-2 mb-2">
            <Image
              src="/plus/Select-FILES.gif"
              alt="How to select files by drawing a box"
              width={620}
              height={400}
              className="rounded shadow-sm"
              style={{ width: "100%", maxWidth: "620px", height: "auto" }}
            />
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-center mb-1">
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
            Don&apos;t show me this modal again.
          </span>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-end align-items-center gap-2 py-2">
        <Button
          variant="light"
          onClick={handleOnHide}
          style={{
            color: "#1f355a",
            borderColor: "rgba(31, 53, 90, 0.35)",
            backgroundColor: "#ffffff",
          }}
        >
          Cancel
        </Button>
        <Button variant="primary" onClick={handleContinueBtnClick}>
          Continue
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CopyLessonHelperModal;
