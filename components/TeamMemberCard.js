import Image from 'next/image';

const TeamMemberCard = ({
  name,
  position,
  children,
  className,
  imgSrc,
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
        [TODO: links]
      </div>
    </div>
  );
};

export default TeamMemberCard;