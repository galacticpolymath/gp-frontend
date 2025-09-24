import Image from 'next/image';
import svg from '../assets/img/tpt.svg';
import Link from 'next/link';

/* eslint-disable react/jsx-max-props-per-line */
const SOCIAL_MEDIA_ITEMS = [

  {
    link: 'https://www.linkedin.com/company/galactic-polymath/',
    icon: <i className='bi bi-linkedin' />,
    color: 'white',
  },
  {
    link: 'https://www.youtube.com/channel/UCfyBNvN3CH4uWmwOCQVhmhg',
    icon: <i className='bi bi-youtube' />,
    color: 'white',
  },
  {
    link: 'https://www.pinterest.com/galacticpolymath/',
    icon: <i className='bi bi-pinterest' />,
    color: 'white',
  },
  {
    link: 'https://www.instagram.com/galacticpolymath/',
    icon: <i className='bi bi-instagram' />,
    color: 'white',
  },
  {
    link: 'https://bsky.app/profile/galacticpolymath.com',
    icon: <i className='bi bi-bluesky' />,
    color: 'white',
  },
  {
    link: 'https://www.teacherspayteachers.com/Store/Galactic-Polymath',
    icon: <Image src={svg} style={{ height: 'fit-content' }} alt='teachers pay teachers Galactic Polymath link' />,
  },
  {
    link: 'https://www.galacticpolymath.com/blog',
    icon: <p className='mb-0 text-lg text-nowrap fw-normal text-white'>Blog</p>,
  },
  {
    link: 'https://www.galacticpolymath.com',
    icon: <p className='mb-0 text-lg text-nowrap fw-normal text-white'>Main Site</p>,
  },
];

export default function Footer() {

  return (
    <footer className="pt-4 bg-dark-gray text-white">
      <div className="container py-4 row mx-auto gap-2 gap-lg-0">
        <div className="col-12 col-lg-5">
          <h4 className="fs-5">Galactic Polymath</h4>
          <p>We translate current research into creative interdisciplinary lessons for grades 5+ that are <em>free for everyone.</em></p>
          <div className="d-flex flex-wrap gap-1">
            {SOCIAL_MEDIA_ITEMS.map(({ link, icon, color }, index) => {
              return (
                <div key={index} className={`${icon.type === 'p' ? '' : 'rounded-circle linkHover'} p-2`}>
                  <Link
                    style={{ fontSize: '21px', color: color ?? '#2D83C3', width: 45, height: 45 }}
                    className="d-flex justify-content-center align-items-center"
                    href={link}
                    target="_blank"
                  >
                    {icon}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
        <div className="col-12 col-lg-3">
          <h4 className="fs-5">Contact</h4>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary my-2 btn-sm"
            href="mailto:info@galacticpolymath.com"
          >
            Email us
          </a>
        </div>
        <div className="col-12 col-lg-4">
          <h4 className="fs-5">Join Our Mailing List</h4>
          <p>Get updates and early access to our latest free lessons and learning tools.</p>
          <a
            className="btn btn-primary btn-sm"
            target="_blank"
            rel="noopener noreferrer"
            href="https://45216c4d.sibforms.com/serve/MUIEABKhQZtQBEauhcYKU3l3n-hkpWQzrO5xzjvf6yI0XwqVvF1MuYlACX2EVtDFWcm1w1nY6lw181I_CUGs3cYjltIR-qTgWYRKLH-zF1Ef_NONTcKn5KiY3iLDyW1Klex1c_dKo2S66mUXo6codlinm0zDopzcmgkU3wW1Wyp-T1L61TZcGWlE49DKcYAszOJj6AKW3MTxs5Q0"
          >
            Subscribe
          </a>
        </div>
      </div>
      <div className="bg-dark text-center text-gray py-3 fs-7">
        made with <span role="img" aria-label="heart" className='mx-1'>❤️</span> by Galactic Polymath &copy; {new Date().getFullYear()}
      </div>
    </footer>
  );
}