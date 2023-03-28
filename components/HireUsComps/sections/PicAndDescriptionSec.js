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
        <section className={regImgStyles}>
          {isRegImg ? (
            <div className="w-100 gpConstellation position-relative" style={{ height: '300px' }}>
              <Image
                src={imgPath}
                alt="Galactic_PolyMath_HireUs_Img"
                className='w-100 h-100'
                sizes="(max-width: 575px) 290px, (max-width: 767px) 253.109px, (max-width: 991px) 327.023px, (max-width: 1199) 395.664px, 475.195px"
                style={{ objectFit: 'contain' }}
                fill
              />
            </div>
          )
            : (
              <div className="position-relative">
                <Image
                  src={imgPath}
                  alt="Galactic_PolyMath_HireUs_Img"
                  sizes="(max-width: 767px) 150px, 200px"
                  className='w-100 h-100'
                  style={{ objectFit: 'contain' }}
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
              style={{ objectFit: 'contain' }}
              fill
            />
          </div>
        </section>
      )}
    </section>
  );
};

export default PicAndDescriptionSec;