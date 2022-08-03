const TeamMemberCard = ({
  imgSrc,
  name,
  position,
  children,
  links = [] ,
  className,
}) => {
  return (
    <div className={`d-flex align-items-stretch ${className}`}>
      <div className='bg-white rounded p-3 mb-4 d-flex flex-column justify-content-between gap-3'>
        [TODO: image]
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