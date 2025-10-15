/* eslint-disable quotes */

import React from "react";
import { Button, Modal as BootstrapModal } from "react-bootstrap";

// Simple modal styles
export const modalStyles: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

export const modalContentStyles: React.CSSProperties = {
  background: "#fff",
  padding: "2rem",
  borderRadius: "8px",
  maxWidth: "90vw",
  maxHeight: "90vh",
  overflow: "auto",
  position: "relative",
};

export const closeButtonStyles: React.CSSProperties = {
  position: "absolute",
  top: "1rem",
  right: "1rem",
  background: "transparent",
  border: "none",
  fontSize: "1.5rem",
  cursor: "pointer",
};

type TBootstrapModalProps = React.ComponentProps<typeof BootstrapModal>;

export interface ModalProps extends TBootstrapModalProps {
  show: boolean;
  onHide: () => void;
  onShow: () => void;
  onBackdropClick: () => void;
  style: React.CSSProperties;
  children: React.ReactNode;
  className?: string;
}

const Modal = ({
  show,
  onBackdropClick,
  children,
  onHide,
  onShow,
  style,
  className,
  backdrop = true,
}: ModalProps) => {
  return (
    <BootstrapModal
      show={show}
      style={style}
      dialogClassName="vw-100"
      onHide={onHide}
      onShow={onShow}
      backdrop={backdrop}
      onBackdropClick={onBackdropClick}
      className={className}
    >
      <Button
        variant="secondary"
        className="close-button"
        onClick={onHide}
        style={closeButtonStyles}
      >
        &times;
      </Button>
      {children}
    </BootstrapModal>
  );
};

export default Modal;
