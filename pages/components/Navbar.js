import Image from 'next/image';
import Link from 'next/link';

import Logo from '../../img/GP_logo_wordmark_horiz_grad_transBG_300.png';

export default function Navbar() {
  return (
    <nav className='navbar navbar-expand-lg navbar-light bg-light'>
      <div className='container'>
        <Link href="/" passHref>
          <a className='flex-grow-1'>
            <Image
              alt="Galactic Polymath"
              src={Logo}
              height={35}
              width={300} />
          </a>
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
            <ul className='navbar-nav me-auto mb-2 mb-lg-0'>
              <li className='nav-item'>
                <Link href='/lessons'>
                  <a className='nav-link'>Lessons</a>
                </Link>
              </li>
              <li className='nav-item'>
                <Link href='/'>
                  <a className='nav-link'>Jobviz</a>
                </Link>
              </li>
              <li className='nav-item'>
                <Link href='/'>
                  <a className='nav-link'>Hire us</a>
                </Link>
              </li>
              <li className='nav-item'>
                <Link href='/'>
                  <a className='nav-link'>About</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
