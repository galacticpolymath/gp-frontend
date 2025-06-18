import React, { FC } from "react";
import { CloseButton, Modal } from "react-bootstrap";
import { TUseStateReturnVal } from "../../types/global";

interface IProps {
  _isSignupModalDisplayed: TUseStateReturnVal<boolean>;
}

const GpPlusSignUp: FC<IProps> = ({ _isSignupModalDisplayed }) => {
  const [isLoginModalDisplayed, setIsLoginModalDisplayed] =
    _isSignupModalDisplayed;

  const handleOnHide = () => {
    setIsLoginModalDisplayed(false);
  };

  return (
    <Modal
      show={isLoginModalDisplayed}
      onHide={handleOnHide}
      dialogClassName="selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center"
      contentClassName="login-ui-modal bg-white shadow-lg rounded pt-2 box-shadow-login-ui-modal"
    >
      <div
        data-o-auth="1"
        data-widget-mode="register"
        data-plan-uid="rmkkjamg"
        data-plan-payment-term="month"
        data-skip-plan-options="true"
        data-mode="embed"
      ></div>
    </Modal>
  );
};

export default GpPlusSignUp;
