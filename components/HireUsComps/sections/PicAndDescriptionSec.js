/* eslint-disable quotes */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import Image from 'next/image';

const PicAndDescriptionSec = ({ text, imgPath, link, name, parentSecStyles, isRegImg }) => {
    let regImgStyles = isRegImg ? 'position-relative imgSection regImgSec ms-sm-1 ms-md-0' : 'position-relative imgSection ms-sm-1 ms-md-0'

    return (
        <section className={`${parentSecStyles ?? ""} picAndDescriptionSec`}>
            <section>
                {link ?
                    <a href={link} target="_blank" className='text-dark'>
                        <span className="text-dark fs-large fw200">{text}</span>
                    </a>
                    :
                    <>
                        {!!name && <h4 className="fw-bold text-dark">{name}</h4>}
                        <span className="text-dark fs-large fw200">{text}</span>
                    </>
                }
            </section>
            {!link &&
                <section className={regImgStyles}>
                        {isRegImg ?
                            <img src={imgPath} alt="Galactic_PolyMath_HireUs_Img" className='w-100 gpConstellation' />
                            :
                            <div className="position-relative">
                                <img src={imgPath} alt="Galactic_PolyMath_HireUs_Img" />
                            </div>
                        }
                </section>
            }
            {link &&
                <section>
                    <div className="imgSquareContainer position-relative borderThicker">
                        <img src={imgPath} alt="Galactic_PolyMath_HireUs_Img" />
                    </div>
                </section>
            }
        </section>
    )
}

export default PicAndDescriptionSec;