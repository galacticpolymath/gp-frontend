/* eslint-disable quotes */
import React from "react";
import { Button, Spinner } from "react-bootstrap";

interface IProps {
  onClick: () => void;
  wasClicked: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const BtnWithSpinner: React.FC<IProps> = ({
  onClick,
  wasClicked,
  children,
  className = "mt-2 no-btn-styles text-white p-2 rounded",
  style = {
    width: "150px",
    backgroundColor: wasClicked ? "grey" : "#4C96CC",
  },
  disabled,
}) => {
  let _style = style;

  if (disabled) {
    _style = {
      ..._style,
      pointerEvents: disabled ? "none" : "auto",
      opacity: disabled ? 0.3 : 1,
    };
  }

  return (
    <Button
      onClick={onClick}
      className={className}
      style={_style}
      disabled={disabled}
    >
      {wasClicked ? <Spinner size="sm" className="text-white" /> : children}
    </Button>
  );
};
