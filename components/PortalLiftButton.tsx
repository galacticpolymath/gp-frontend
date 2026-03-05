import Link from "next/link";
import React from "react";
import styles from "./PortalLiftButton.module.css";

type PortalLiftButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

const PortalLiftButton: React.FC<PortalLiftButtonProps> = ({
  href,
  children,
  className = "",
}) => (
  <Link className={`${styles.button} ${className}`.trim()} href={href}>
    {children}
  </Link>
);

export default PortalLiftButton;
