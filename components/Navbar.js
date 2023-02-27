import { useRouter } from 'next/router';
import Image from "next/image";
import Link from 'next/link';

import Logo from '../assets/img/galactic_polymath_white.png';

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className='navbar sticky-top navbar-expand-lg navbar-dark bg-dark'>
      <div className='container'>
        <Link href="/" passHref className='flex-grow-1'>

          <Image
            alt="Galactic Polymath"
            src={Logo}
            height={35}
            width={300}
            style={{
              maxWidth: "100%",
              height: "auto"
            }} />

        </Link>
        <button
          className='navbar-toggler'
          type='button'
          data-bs-toggle='collapse'
          data-bs-target='#navbarSupportedContent'
          aria-controls='navbarSupportedContent'
          aria-expanded='false'
          aria-label='Toggle navigation'
        >
          <span className='navbar-toggler-icon'></span>
        </button>
        <div>
          <div className='collapse navbar-collapse' id='navbarSupportedContent'>
            <ul className='navbar-nav me-auto mb-2 mb-lg-0 fs-5 text-uppercase'>
              <li className='nav-item'>
                <Link
                  href='/'
                  className={`nav-link ${router.pathname === '/' ? 'fw-bold active' : 'fw-light'}`}>
                  Home
                </Link>
              </li>
              {[
                ['/lessons', 'Lessons'],
                //* ['/jobviz', 'Jobviz'], */}
                ['/hire-us', 'Hire Us'],
                ['/about', 'About'],
              ].map(([url, title]) => (
                <li key={url} className='nav-item'>
                  <Link
                    href={url}
                    className={`nav-link ${router.pathname.includes(url) ? 'fw-bold active' : 'fw-light'}`}>

                    {title}

                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
