import { Modal, Spinner } from "react-bootstrap";
import { useModalContext } from "../../providers/ModalProvider";
import { useEffect, useState } from "react";

interface IProps {
  outsetaPassword: string;
}

const CreatingMembership = ({ outsetaPassword }: IProps) => {
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
    if (!wasOutsetaPasswordSet && outsetaPassword) {
      setWasOutsetaPasswordSet(true);
    }
  }, [outsetaPassword]);

  return (
    <Modal
      show={isCreatingGpAccount}
      onHide={() => {}}
      dialogClassName="border-0 selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center"
      contentClassName="about-me-modal user-modal-color rounded-0"
    >
      <h6>Creating your GP Plus account, please wait...</h6>
      <Spinner className="text-black" />
    </Modal>
  );
};

export default CreatingMembership;
