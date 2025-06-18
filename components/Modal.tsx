import React from "react";

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

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div style={modalStyles} onClick={onClose}>
      <div style={modalContentStyles} onClick={(e) => e.stopPropagation()}>
        <button
          style={closeButtonStyles}
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
