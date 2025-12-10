import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import logo from '../assets/img/logo.png';
import mobileLogo from '../assets/img/mobile_logo.png';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import LoginContainerForNavbar from './User/Login/LoginContainerForNavbar';
import { useSearchParams } from 'next/navigation';
import { useLessonContext } from '../providers/LessonProvider';
import { JobToursCardTopSticky } from './JobViz/JobTours/JobToursCard';
import useSiteSession from '../customHooks/useSiteSession';

export const DISABLE_NAVBAR_PARAM_NAME = 'disableNavbar';

export default function Navbar() {
  const searchParams = useSearchParams();
  const disableNavbar = searchParams.get(DISABLE_NAVBAR_PARAM_NAME) === 'true';
  const router = useRouter();
  const session = useSession();
  const [modalAnimation, setModalAnimation] = useState('d-none');
  const [isNavHidden, setIsNavHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const {
    isGpPlusMember
  } = useSiteSession()
  const {
      _isJobToursStickyTopCardDisplayed: [isJobToursStickTopCardDisplayed],
      _willRenderJobToursStickyTopCard: [willRenderJobToursStickyTopCard],
    } = useLessonContext();

  useEffect(() => {
    if (typeof window === 'undefined' || disableNavbar) return;

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

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [disableNavbar]);

  return (
    <nav
      style={{
        zIndex: 1000,
        transform: isNavHidden ? 'translateY(-115%)' : 'translateY(0)',
        opacity: isNavHidden ? 0.92 : 1,
        transition:
          'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.35s ease',
        willChange: 'transform, opacity',
      }}
      className={`fixed-top w-100 navbar-expand-lg py-0 ${disableNavbar ? 'pe-none' : ''}`}
    >
      <div
        className='navbar navbar-expand-lg w-100 navbar-dark bg-dark position-relative'
        style={{ paddingTop: '0.35rem', paddingBottom: '0.35rem' }}
      >
        <div className='w-100 container'>
          <Image
            className='object-fit-contain d-none d-sm-block'
            alt='Galactic Polymath'
            src={logo}
            height={56}
            width={700}
            style={{
              maxHeight: '48px',
              width: 'auto',
              height: 'auto',
            }}
          />
          <Image
            className='object-fit-contain d-block d-sm-none'
            alt='Galactic Polymath'
            src={mobileLogo}
            height={56}
            width={150}
            style={{
              maxHeight: '48px',
              width: 'auto',
              height: 'auto',
            }}
          />
          <div style={{ color: 'white' }} className="flex-grow-1 white" />
          <button
            className="navbar-toggler m-2"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
            onClick={() => {
              setModalAnimation('fade-out-quick');
            }}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div>
            <div
              className='collapse navbar-collapse'
              id='navbarSupportedContent'
            >
              <ul className='navbar-nav fs-5 text-uppercase'>
                <li className='nav-item my-auto'>
                  <Link
                    href='/'
                    className={`nav-link ${router.pathname === '/' ? 'fw-bold active' : 'fw-light'
                      }`}
                  >
                    Home
                  </Link>
                </li>
              </ul>
              {(!router.asPath.includes('/account') ||
                session.status === 'authenticated') && (
                  <LoginContainerForNavbar
                    className='login-container'
                    _modalAnimation={[modalAnimation, setModalAnimation]}
                  />
                )}
            </div>
          </div>
        </div>
      </div>
      {(router.pathname.includes('jobviz') && isGpPlusMember) && <JobToursCardTopSticky />}
    </nav>
  );
}
