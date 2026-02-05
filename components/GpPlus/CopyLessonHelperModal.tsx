 

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
      alert(
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
            Don&apos;t show me this modal again.
          </span>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between align-items-center flex-column">
        <Button variant="primary" onClick={handleContinueBtnClick}>
          Continue
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CopyLessonHelperModal;
