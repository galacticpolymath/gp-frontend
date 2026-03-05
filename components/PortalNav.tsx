import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { Home, Menu, Search } from "lucide-react";
import useSiteSession from "../customHooks/useSiteSession";
import styles from "./PortalNav.module.css";
import GpLogo from "../public/GP_bubbleLogo300px.png";
import { setSessionStorageItem } from "../shared/fns";
import ProfileAvatarRing from "./ProfileAvatarRing";

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
  const isUnitRoute =
    router.pathname === "/units/[loc]/[id]" ||
    (typeof router.asPath === "string" && router.asPath.startsWith("/units/"));
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
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const navHiddenRef = useRef(false);
  const { status, user, isGpPlusMember, logUserOut } = useSiteSession();
  const isAuthenticated = status === "authenticated";
  const avatarUrl = user?.image ?? profileAvatarUrl ?? null;
  const isPlusMember = isGpPlusMember === true;
  const effectiveIsAuthenticated = isHydrated ? isAuthenticated : false;
  const effectiveIsPlusMember = isHydrated ? isPlusMember : false;
  const effectiveAvatarUrl =
    isHydrated && isAuthenticated ? avatarUrl : null;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setAvatarError(false);
  }, [effectiveAvatarUrl]);

  useEffect(() => {
    if (isAuthenticated) return;
    setProfileAvatarUrl(null);
    setAvatarError(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;

    const localAvatarUrl = (() => {
      if (typeof window === "undefined") return null;

      try {
        const raw = window.localStorage.getItem("userAccount");

        if (!raw) return null;
        const parsed = JSON.parse(raw);

        return typeof parsed?.picture === "string" && parsed.picture
          ? parsed.picture
          : null;
      } catch {
        return null;
      }
    })();

    if (localAvatarUrl) {
      setProfileAvatarUrl(localAvatarUrl);
    }

  }, [isHydrated, isAuthenticated]);


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
    navHiddenRef.current = isNavHidden;
  }, [isNavHidden]);

  useEffect(() => {
    if (disableNavbar) return;
    if (isUnitRoute) return;
    if (navOpen || accountMenuOpen) {
      setIsNavHidden(false);
    }
  }, [disableNavbar, isUnitRoute, navOpen, accountMenuOpen]);

  useEffect(() => {
    if (disableNavbar) return;
    if (typeof window === "undefined") return;
    const root = document.documentElement;

    const handleSetNavHidden = (
      event: CustomEvent<{ hidden?: boolean; source?: string }>
    ) => {
      const source = event.detail?.source;
      if (isUnitRoute && source !== "unit-manual") {
        return;
      }
      const hidden = event.detail?.hidden === true;
      navHiddenRef.current = hidden;
      setIsNavHidden(hidden);

      const navHeight = navRef.current?.getBoundingClientRect().height ?? 0;
      const offset = hidden ? 0 : Math.max(0, Math.round(navHeight));
      root.style.setProperty("--portal-nav-offset", `${offset}px`);
    };

    window.addEventListener(
      "gp:set-nav-hidden",
      handleSetNavHidden as EventListener
    );

    return () => {
      window.removeEventListener(
        "gp:set-nav-hidden",
        handleSetNavHidden as EventListener
      );
    };
  }, [disableNavbar, isUnitRoute]);

  useEffect(() => {
    if (disableNavbar) return;
    if (typeof window === "undefined") return;
    if (isUnitRoute) return;
    if (!navHiddenRef.current) return;

    navHiddenRef.current = false;
    setIsNavHidden(false);
    const navHeight = navRef.current?.getBoundingClientRect().height ?? 0;
    document.documentElement.style.setProperty(
      "--portal-nav-offset",
      `${Math.max(0, Math.round(navHeight))}px`
    );
  }, [disableNavbar, isUnitRoute]);

  useEffect(() => {
    if (disableNavbar) return;
    if (typeof window === "undefined") return;
    if (!isUnitRoute) return;

    navHiddenRef.current = true;
    setIsNavHidden(true);
    document.documentElement.style.setProperty("--portal-nav-offset", "0px");
  }, [disableNavbar, isUnitRoute]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;

    if (disableNavbar) {
      root.style.removeProperty("--portal-nav-offset");
      return;
    }

    const syncOffset = () => {
      const navHeight = navRef.current?.getBoundingClientRect().height ?? 0;
      const offset = isNavHidden ? 0 : Math.max(0, Math.round(navHeight));
      root.style.setProperty("--portal-nav-offset", `${offset}px`);
    };

    syncOffset();
    window.addEventListener("resize", syncOffset);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => syncOffset())
        : null;
    if (observer && navRef.current) {
      observer.observe(navRef.current);
    }

    return () => {
      window.removeEventListener("resize", syncOffset);
      observer?.disconnect();
    };
  }, [disableNavbar, isNavHidden, navOpen, accountMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    return () => {
      document.documentElement.style.removeProperty("--portal-nav-offset");
    };
  }, []);

  if (disableNavbar) {
    return null;
  }

  return (
    <nav
      ref={navRef}
      className={`${styles.nav} ${isUnitRoute ? styles.navFixedForUnits : ""} ${isNavHidden ? styles.navHidden : ""}`}
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
          <span className={styles.navTabsLabel}>
            <Search size={12} aria-hidden="true" />
            <span>Search + Explore</span>
          </span>
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
              <ProfileAvatarRing
                avatarUrl={effectiveAvatarUrl && !avatarError ? effectiveAvatarUrl : null}
                isPlusMember={effectiveIsPlusMember}
                onError={() => setAvatarError(true)}
              />
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
            <Link
              className={styles.profileToggle}
              href="/account"
              onClick={(event) => {
                if (typeof window === "undefined") {
                  return;
                }
                const returnUrl = window.location.href;
                setSessionStorageItem("userEntryRedirectUrl", returnUrl);
                const accountUrl = `/account?from=${encodeURIComponent(returnUrl)}`;
                event.preventDefault();
                router.push(accountUrl);
              }}
            >
              <ProfileAvatarRing
                avatarUrl={effectiveAvatarUrl && !avatarError ? effectiveAvatarUrl : null}
                isPlusMember={effectiveIsPlusMember}
                onError={() => setAvatarError(true)}
              />
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
                <Image
                  src="/plus/plus.png"
                  alt="GP+"
                  width={12}
                  height={12}
                  className={styles.accountMenuPlusIcon}
                />
                <span>My JobViz Tours</span>
              </Link>
              <Link className={styles.accountMenuItem} href="/jobviz?saved=1">
                Saved Jobs
              </Link>
              <Link className={styles.accountMenuItem} href="/account">
                View Account
              </Link>
              <button
                className={styles.accountMenuItem}
                type="button"
                onClick={() => {
                  setProfileAvatarUrl(null);
                  setAvatarError(false);
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
