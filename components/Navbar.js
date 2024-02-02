import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '../assets/img/galactic_polymath_white.png';

export default function Navbar() {
  const router = useRouter();

  return ( 
    <nav style={{ zIndex: 1000 }} className='w-100 navbar position-fixed navbar-expand-lg navbar-dark bg-dark  py-0'>
      <div style={{ zIndex: 10000 }} className='w-100 container'>
        <Link
          href="/"
          passHref
          className='flex-grow-1'
        >
          <Image
            className='object-fit-contain'
            alt="Galactic Polymath"
            src={Logo}
            height={68}
            width={841}
            style={{
              maxHeight: '25px',
              maxWidth:'75vw',
              width: 'auto',
              height: 'auto',
            }}
          />

        </Link>
        {/* filler */}
        <div style={{ color:'white' }} className='flex-grow-1 white' />
        <button
          className='navbar-toggler m-2'
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
          <div className='collapse navbar-collapse ' id='navbarSupportedContent'>
            <ul className='navbar-nav fs-5 text-uppercase '>
              <li className='nav-item my-auto'>
                <Link
                  href='/'
                  className={`nav-link ${router.pathname === '/' ? 'fw-bold active' : 'fw-light'}`}
                >
                  Home
                </Link>
              </li>
              {[
                ['/lessons', 'Lessons'],
                //* ['/jobviz', 'Jobviz'], */}
                ['/hire-us', 'Hire Us'],
                ['/about', 'About'],
              ].map(([url, title]) => (
                <li key={url} className='nav-item my-auto'>
                  <Link
                    href={url}
                    className={`nav-link ${router.pathname.includes(url) ? 'fw-bold active' : 'fw-light'}`}
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
    // </div>
  );
}
