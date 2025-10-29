/* eslint-disable react/jsx-max-props-per-line */
 
import Image from 'next/image';
import { BsTwitch } from 'react-icons/bs';

const DEFAULT_IMG_SRC = '/imgs/gp_logo_gradient_transBG.png';

const faIcons = [{ name: 'BsTwitch', comp: BsTwitch }];

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
              src={imgSrc ?? DEFAULT_IMG_SRC}
              alt="Team_member_image"
              fill
              style={{ objectFit: 'contain' }}
              sizes="130px"
              className="rounded-circle shadow"
            />
          </div>
        </section>
        <div>
          <p className='text-center fw-bold fs-4 mb-1'>{name}</p>
          <p className='text-muted text-center fw-light text-uppercase m-0'>{position}</p>
        </div>
        <div className='flex-grow-1 text-center'>{children}</div>
        <div className='d-flex justify-content-center align-items-center'>
          <div className="d-flex">
            {links && links.map(({ link, icon, imgSrc, reactIcon }, index) => {
              let Icon;

              if (reactIcon) {
                Icon = faIcons.find(({ name }) => name === reactIcon)?.comp;
              }

              return (
                <a
                  key={`${index}_${name}`}
                  style={{ fontSize: '21px', color: '#2D83C3', width: 40, height: 40 }}
                  className={`linkHover rounded-circle pointer d-flex justify-content-center align-items-center ${(index !== 0) ? 'ms-1' : ''}`}
                  href={link}
                  target="_blank"
                >
                  {icon && <i className={icon} />}
                  {(reactIcon && Icon) && <Icon />}
                  {(!icon && !reactIcon) && <Image src={imgSrc} alt="social_icon" width={40} height={40} />}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;
