/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-wrap-multilines */
import Image from 'next/image';
// import { ReactComponent as ScholarIcon } from '../public/imgs/about/google-scholar.svg';

const TeamMemberCard = ({
  name,
  position,
  children,
  className,
  imgSrc,
  links,
}) => {
  return (
    <div className={`d-flex align-items-stretch ${className}`}>
      <div className='bg-white rounded p-3 mb-4 d-flex flex-column justify-content-between gap-3'>
        <section className="d-flex justify-content-center align-items-center">
          <div style={{ width: 130, height: 130 }} className="position-relative">
            <Image
              src={imgSrc}
              alt="Team_member_image"
              fill
              style={{ objectFit: 'contain' }}
              className="rounded-circle"
            />
          </div>
        </section>
        <div>
          <p className='text-center fw-bold fs-4 mb-1'>{name}</p>
          <p className='text-muted text-center fw-light text-uppercase m-0'>{position}</p>
        </div>
        <div className='flex-grow-1'>{children}</div>
        <div className='d-flex justify-content-center align-items-center'>
          <div className="d-flex">
            {links && links.map(({ link, icon, imgSrc }, index) => (
              <a
                key={`${index}_${name}`}
                style={{ fontSize: '21px', color: '#2D83C3', width: 40, height: 40 }}
                className={`linkHover rounded-circle d-flex justify-content-center align-items-center ${(index !== 0) ? 'ms-1' : ''}`}
                href={link}
              >
                {icon ? <i className={icon} /> : <div style={{ width: 30, height: 30 }} className='position-relative'><Image fill src={imgSrc} alt='Galactic_Polymath_Icon_Link' /></div>}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;