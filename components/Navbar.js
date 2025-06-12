/* eslint-disable react/jsx-indent */
/* eslint-disable indent */

import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import logo from '../assets/img/logo.png';
import mobileLogo from '../assets/img/mobile_logo.png';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import LoginContainerForNavbar from './User/Login/LoginContainerForNavbar';

export default function Navbar() {
  const router = useRouter();
  const session = useSession();
  const [modalAnimation, setModalAnimation] = useState('d-none');

  return (
    <nav
      style={{ zIndex: 1000 }}
      className="position-fixed w-100 navbar-expand-lg py-0"
    >
      <div className='navbar navbar-expand-lg w-100 navbar-dark bg-dark position-relative'>
        <div style={{ zIndex: 10000 }} className='w-100 container'>
          <Image
            className='object-fit-contain d-none d-sm-block'
            alt='Galactic Polymath'
            src={logo}
            height={68}
            width={841}
            style={{
              maxHeight: '60px',
              width: 'auto',
              height: 'auto',
            }}
          />
          <Image
            className='object-fit-contain d-block d-sm-none'
            alt='Galactic Polymath'
            src={mobileLogo}
            height={68}
            width={150}
            style={{
              maxHeight: '60px',
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
    </nav>
  );
}