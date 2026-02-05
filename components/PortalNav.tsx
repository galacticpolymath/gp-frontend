import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { Home, ListFilter, Menu } from "lucide-react";
import useSiteSession from "../customHooks/useSiteSession";
import styles from "./PortalNav.module.css";
import GpLogo from "../public/GP_bubbleLogo300px.png";

const NAV_TABS = ["All", "Units", "Apps", "Videos", "Lessons", "JobViz"] as const;
export type NavTab = (typeof NAV_TABS)[number];

interface PortalNavProps {
  activeTab?: NavTab | null;
  onTabClick?: (tab: NavTab) => void;
  onBrandClick?: () => void;
}

export const DISABLE_NAVBAR_PARAM_NAME = "disableNavbar";

const buildRootQueryForTab = (tab: NavTab) => {
  switch (tab) {
    case "Units":
      return { typeFilter: ["Unit"] };
    case "Apps":
      return { typeFilter: ["App"] };
    case "Videos":
      return { typeFilter: ["Video"] };
    case "Lessons":
      return { typeFilter: ["Lesson"] };
    case "JobViz":
      return { typeFilter: ["Job Tour"] };
    default:
      return {};
  }
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
  const navOpenRef = useRef(false);
  const accountMenuOpenRef = useRef(false);
  const { status, user, isGpPlusMember, logUserOut } = useSiteSession();
  const isAuthenticated = status === "authenticated";
  const avatarUrl = user?.image ?? null;
  const isPlusMember = isGpPlusMember === true;
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

  useEffect(() => {
    accountMenuOpenRef.current = accountMenuOpen;
    if (accountMenuOpen) {
      setIsNavHidden(false);
    }
  }, [accountMenuOpen]);

  useEffect(() => {
    if (disableNavbar) return;
    navOpenRef.current = navOpen;
    if (navOpen) {
      setIsNavHidden(false);
    }
  }, [disableNavbar, navOpen]);

  useEffect(() => {
    if (disableNavbar) return;
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      if (navOpenRef.current) return;
      if (accountMenuOpenRef.current) return;
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
  }, [disableNavbar]);

  if (disableNavbar) {
    return null;
  }

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
            <span className={styles.brandHomeIcon} aria-hidden="true">
              <Home />
            </span>
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
        onClick={() => {
          setIsNavHidden(false);
          setNavOpen((prev) => !prev);
        }}
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
                router.push({ pathname: "/search", query: buildRootQueryForTab(tab) });
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
              onClick={() => {
                setIsNavHidden(false);
                setAccountMenuOpen((prev) => !prev);
              }}
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
              <span className={styles.profileButton}>
                <span
                  className={
                    effectiveIsPlusMember
                      ? styles.profileBadgePlus
                      : styles.profileBadgeFree
                  }
                >
                  {effectiveIsPlusMember ? "GP+" : "Free"}
                </span>
              </span>
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
              <span className={styles.profileButton}>
                Log in
                <span className={styles.profileBadgeFree}>Free</span>
              </span>
            </Link>
          )}
          {effectiveIsAuthenticated && (
            <div
              className={styles.accountMenu}
              role="menu"
              aria-hidden={!accountMenuOpen}
            >
              <div className={styles.accountMenuDivider} role="presentation" />
              <Link
                className={styles.accountMenuItem}
                href="/search?typeFilter=Job%20Tour&mine=1"
              >
                My JobViz Tours
              </Link>
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
