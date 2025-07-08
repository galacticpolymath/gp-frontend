/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */

import React from "react";
import Link from "next/link";
import { ReactNode } from "react";

interface IProps {
  hrefStr?: string;
  children?: ReactNode;
  fontSize?: string | number;
  targetLinkStr?: "_self" | "_blank" | "_parent" | "_top";
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

const CustomLink = ({
  hrefStr = "",
  children,
  fontSize = undefined,
  targetLinkStr = "_self",
  color = "",
  style = {},
  className = "no-link-decoration",
}: IProps) => {
  if (color) {
    style.color = color;
  }
  if (fontSize) {
    style.fontSize = fontSize;
  }

  return (
    <Link
      style={style}
      href={hrefStr}
      target={targetLinkStr}
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </Link>
  );
};

export default CustomLink;
