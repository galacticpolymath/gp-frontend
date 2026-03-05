import Link from "next/link";
import React from "react";
import styles from "./PortalLiftButton.module.css";

type PortalLiftButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  color?: "white" | "hydro";
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
};

const PortalLiftButton: React.FC<PortalLiftButtonProps> = ({
  href,
  children,
  className = "",
  color = "white",
  target,
  rel,
}) => (
  <Link
    className={`${styles.button} ${styles[`color${color[0].toUpperCase()}${color.slice(1)}`]} ${className}`.trim()}
    href={href}
    target={target}
    rel={rel}
  >
    {children}
  </Link>
);

export default PortalLiftButton;
