import { Modal, Spinner } from "react-bootstrap";
import { useModalContext } from "../../providers/ModalProvider";
import { useEffect, useState } from "react";
import { getSubmitBtn } from "../../pages/gp-plus-set-password";

interface IProps {
  canSubmitPasswordForm: boolean;
}

const CreatingMembership = ({ canSubmitPasswordForm }: IProps) => {
  const { _isCreatingGpPlusAccount } = useModalContext();
  const [isCreatingGpAccount] = _isCreatingGpPlusAccount;
  const [wasOutsetaPasswordSet, setWasOutsetaPasswordSet] = useState(false);

  const handleOnHide = () => {
    const backDropOutseta = document.querySelector(".o--Widget--popupBg");

    if (backDropOutseta) {
      (backDropOutseta as HTMLElement).click();
    }

    setWasOutsetaPasswordSet(false);
  };

  useEffect(() => {
    if (!wasOutsetaPasswordSet && canSubmitPasswordForm) {
      // if the outseta password is set, then click on the submit button on the modal
      // GOAL: get the outseta submit button via the html

      const passwordSubmitBtn = getSubmitBtn();

      console.log("passwordSubmitBtn: ", passwordSubmitBtn);

      setWasOutsetaPasswordSet(true);
    }
  }, [canSubmitPasswordForm]);

  return (
    <Modal
      show={isCreatingGpAccount}
      onHide={() => {}}
      dialogClassName="border-0 selected-gp-web-app-dialog m-0 d-flex justify-content-center mt-5"
      contentClassName="gp-plus-member-modal user-modal-color rounded px-3 pb-5 pt-4 mt-0"
      style={{
        zIndex: 9999000000000,
        height: "fit-content",
      }}
    >
      <h6 className="text-center">
        Creating your GP Plus account, please wait...
      </h6>
      <div className="d-flex justify-content-center mt-3">
        <Spinner className="text-black" />
      </div>
    </Modal>
  );
};

export default CreatingMembership;
