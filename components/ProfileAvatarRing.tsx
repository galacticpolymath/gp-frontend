import React from "react";
import styles from "./ProfileAvatarRing.module.css";

type ProfileAvatarRingProps = {
  avatarUrl?: string | null;
  isPlusMember: boolean;
  fallbackText?: string;
  size?: number;
  className?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  ariaHidden?: boolean;
};

const ProfileAvatarRing: React.FC<ProfileAvatarRingProps> = ({
  avatarUrl,
  isPlusMember,
  fallbackText = "GP",
  size = 40,
  className,
  onError,
  ariaHidden = true,
}) => {
  return (
    <span
      className={`${styles.profileAvatarRing} ${
        isPlusMember ? styles.profileAvatarPlus : styles.profileAvatarFree
      } ${className ?? ""}`}
      style={{ ["--avatar-size" as const]: `${size}px` }}
      aria-hidden={ariaHidden}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className={styles.profileAvatarImage}
          onError={onError}
        />
      ) : (
        <span className={styles.profileAvatarFallback}>{fallbackText}</span>
      )}
    </span>
  );
};

export default ProfileAvatarRing;
