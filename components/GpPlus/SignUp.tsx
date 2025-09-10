/* eslint-disable quotes */

import React, { FC, useEffect } from "react";
import { Modal as BootstrapModal } from "react-bootstrap";
import { TUseStateReturnVal } from "../../types/global";

interface IProps {
  _isSignupModalDisplayed: TUseStateReturnVal<boolean>;
}

interface IContent {
  isOpen: boolean;
  children: React.ReactNode;
}

const Content = ({ isOpen, children }: IContent) => {
  return (
    <div
      className={isOpen ? "content-wrapper content-open" : "content-wrapper"}
    >
      {/* <i className="fa fa-times-circle" onClick={this.props.buttonClick}></i> */}
      {children}
    </div>
  );
};

const Modal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  return (
    <div className={isOpen ? "inner-modal inner-modal-open" : "inner-modal"}>
      <Content isOpen={isOpen}>{children}</Content>
    </div>
  );
};

const GpPlusSignUp: FC<IProps> = ({ _isSignupModalDisplayed }) => {
  const [isLoginModalDisplayed, setIsLoginModalDisplayed] =
    _isSignupModalDisplayed;

  const handleOnHide = () => {
    setIsLoginModalDisplayed(false);
  };

  useEffect(() => {
    const widgetEl = document.createElement("div");

    widgetEl.setAttribute("data-o-auth", "1");
    widgetEl.setAttribute("data-widget-mode", "register");
    widgetEl.setAttribute("data-plan-uid", "rmkkjamg");
    widgetEl.setAttribute("data-plan-payment-term", "month");
    widgetEl.setAttribute("data-skip-plan-options", "true");
    widgetEl.setAttribute("data-mode", "embed");

    const parent = document.getElementById("outseta-sign-up");

    parent?.appendChild(widgetEl);
  }, []);

  return (
    <BootstrapModal
      show={isLoginModalDisplayed}
      onHide={handleOnHide}
    >
    </BootstrapModal>
  );
};

export default GpPlusSignUp;
