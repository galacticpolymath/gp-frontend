import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { ListFilter, Menu } from "lucide-react";
import useSiteSession from "../customHooks/useSiteSession";
import styles from "./PortalNav.module.css";
import GpLogo from "../public/GP_bubbleLogo300px.png";

const NAV_TABS = ["All", "Units", "Apps", "Videos", "Lessons"] as const;
export type NavTab = (typeof NAV_TABS)[number];

interface PortalNavProps {
  activeTab?: NavTab | null;
  onTabClick?: (tab: NavTab) => void;
  onBrandClick?: () => void;
}

export const DISABLE_NAVBAR_PARAM_NAME = "disableNavbar";

const buildRootQueryForTab = (tab: NavTab) => {
  if (tab === "All") return {};
  const type = tab.toLowerCase().slice(0, -1);
  return { type };
};

const PortalNav: React.FC<PortalNavProps> = ({
  activeTab = "All",
  onTabClick,
  onBrandClick,
}) => {
  const router = useRouter();
  const disableNavbar = (() => {
    const value = router.query?.[DISABLE_NAVBAR_PARAM_NAME];
    if (Array.isArray(value)) {
      return value.includes("true");
    }
    return value === "true";
  })();

  const [navOpen, setNavOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const { status, user, isGpPlusMember, logUserOut } = useSiteSession();
  const isAuthenticated = status === "authenticated";
  const avatarUrl = user?.image ?? null;
  const isPlusMember = isGpPlusMember === true || isGpPlusMember === "true";
  const effectiveIsAuthenticated = isHydrated ? isAuthenticated : false;
  const effectiveIsPlusMember = isHydrated ? isPlusMember : false;
  const effectiveAvatarUrl = isHydrated ? avatarUrl : null;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!accountMenuRef.current) return;
      if (!accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountMenuOpen]);

  if (disableNavbar) {
    return null;
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY || 0;
        const previousY = lastScrollY.current;
        const delta = currentY - previousY;

        if (currentY < 80) {
          setIsNavHidden(false);
        } else if (delta > 5) {
          setIsNavHidden(true);
        } else if (delta < -5) {
          setIsNavHidden(false);
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`${styles.nav} ${isNavHidden ? styles.navHidden : ""}`}
      data-nav-hidden={isNavHidden ? "true" : "false"}
    >
      <button
        className={styles.brandButton}
        type="button"
        onClick={() => {
          if (onBrandClick) {
            onBrandClick();
          } else {
            router.push("/");
          }
        }}
        aria-label="Go to the GP Teacher Portal home"
      >
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <Image src={GpLogo} alt="Galactic Polymath" priority />
          </div>
          <div>
            <p className={styles.brandTitle}>
              GP Teacher
              <span className={styles.brandTitleBreak}>Portal</span>
            </p>
            <p className={styles.brandSubtitle}>
              Interdisciplinary science for grades 5-12+
            </p>
          </div>
        </div>
      </button>
      <button
        className={styles.navToggle}
        type="button"
        aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={navOpen}
        onClick={() => setNavOpen((prev) => !prev)}
      >
        <Menu aria-hidden="true" />
      </button>
      <div className={`${styles.navRight} ${navOpen ? styles.navRightOpen : ""}`}>
        <div className={styles.navTabsGroup}>
          <span className={styles.navTabsLabel}>Search + Explore</span>
          <div className={styles.navTabs} role="tablist" aria-label="Resource types">
            {NAV_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`${styles.navTab} ${
                  activeTab === tab ? styles.navTabActive : ""
                }`}
                onClick={() => {
                if (onTabClick) {
                  onTabClick(tab);
                  return;
                }
                const pathname = tab === "All" ? "/search" : "/";
                router.push({ pathname, query: buildRootQueryForTab(tab) });
              }}
            >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div
          className={`${styles.profileSlot} ${
            accountMenuOpen ? styles.profileSlotOpen : ""
          }`}
          ref={accountMenuRef}
        >
          {effectiveIsAuthenticated ? (
            <button
              className={styles.profileToggle}
              type="button"
              aria-haspopup="menu"
              aria-expanded={accountMenuOpen}
              onClick={() => setAccountMenuOpen((prev) => !prev)}
            >
              <div
                className={`${styles.profileAvatarRing} ${
                  effectiveIsPlusMember
                    ? styles.profileAvatarPlus
                    : styles.profileAvatarFree
                }`}
                aria-hidden="true"
              >
                {effectiveAvatarUrl && !avatarError ? (
                  <img
                    src={effectiveAvatarUrl}
                    alt=""
                    className={styles.profileAvatarImage}
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className={styles.profileAvatarFallback}>GP</span>
                )}
              </div>
              <span className={styles.profileButton}>Account</span>
            </button>
          ) : (
            <Link className={styles.profileToggle} href="/account">
              <div
                className={`${styles.profileAvatarRing} ${
                  effectiveIsPlusMember
                    ? styles.profileAvatarPlus
                    : styles.profileAvatarFree
                }`}
                aria-hidden="true"
              >
                {effectiveAvatarUrl && !avatarError ? (
                  <img
                    src={effectiveAvatarUrl}
                    alt=""
                    className={styles.profileAvatarImage}
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className={styles.profileAvatarFallback}>GP</span>
                )}
              </div>
              <span className={styles.profileButton}>Log in</span>
            </Link>
          )}
          {effectiveIsAuthenticated && (
            <div
              className={styles.accountMenu}
              role="menu"
              aria-hidden={!accountMenuOpen}
            >
              <div className={styles.accountMenuDivider} role="presentation" />
              <Link className={styles.accountMenuItem} href="/account">
                View Account
              </Link>
              <button
                className={styles.accountMenuItem}
                type="button"
                onClick={() => {
                  setAccountMenuOpen(false);
                  logUserOut();
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PortalNav;
