import Image from 'next/image';

const PicAndDescriptionSec = ({ text, imgPath, link, name, parentSecStyles, isRegImg }) => {
  let regImgStyles = isRegImg ? 'position-relative imgSection regImgSec ms-sm-1 ms-md-0' : 'position-relative imgSection ms-sm-1 ms-md-0';

  return (
    <section className={`${parentSecStyles ?? ''} picAndDescriptionSec`}>
      <section>
        {link ? (
          <a
            href={link}
            target="_blank"
            className='text-dark'
          >
            <span className="text-dark fw200">{text}</span>
          </a>
        )
          : (
            <>
              {!!name && <h4 className="fw-bold text-dark">{name}</h4>}
              <span className="text-dark fw200">{text}</span>
            </>
          )}
      </section>
      {!link && (
        <section style={{ width: '33vw' }} className={regImgStyles}>
          {isRegImg ? (
            <div className="w-100 gpConstellation position-relative">
              <Image
                src={imgPath}
                alt="Galactic_PolyMath_HireUs_Img"
                className='w-100 h-100'
                fill
              />
            </div>
          )
            : (
              <div className="position-relative">
                <Image
                  src={imgPath}
                  alt="Galactic_PolyMath_HireUs_Img"
                  className='w-100 h-100'
                  fill
                />
              </div>
            )}
        </section>
      )}
      {link && (
        <section>
          <div className="imgSquareContainer position-relative borderThicker">
            <Image
              src={imgPath}
              alt="Galactic_PolyMath_HireUs_Img"
              className='w-100 h-100'
              fill
            />
          </div>
        </section>
      )}
    </section>
  );
};

export default PicAndDescriptionSec;