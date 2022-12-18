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

const PicAndImageSec = ({ isFlexReversed, isImgCircle, text, imgPath, customTxtSpanClassNames, imgMainSectionCustomCss, link, txtSectionCssClasses }) => {
    const classNamesMainSec = `d-flex picAndImgSec ${isFlexReversed ? 'flex-row-reverse' : 'flex-row'}`
    const txtSpanClassNames = `text-dark fw245 ${customTxtSpanClassNames ?? ''}`;
    const imgMainSectionClassNames = `d-flex align-items-center ${imgMainSectionCustomCss ?? ''}`
    const imageClassNames = isImgCircle ? 'rounded-circle humanImg borderThicker' : 'square';
    const txtSection = `d-flex justify-content-center ${txtSectionCssClasses ?? ''}`

    return (
        <section className={classNamesMainSec}>
            <section className={txtSection}>
                {link ?
                    <a href={link} target="_blank">
                        <span className={txtSpanClassNames}>{text}</span>
                    </a>
                    :
                    <span className={txtSpanClassNames}>{text}</span>
                }
            </section>
            {!link &&
                <section className={imgMainSectionClassNames}>
                    {isImgCircle ?
                        <Image src={imgPath} width={163} height={163} alt="Galactic_PolyMath_HireUs_Img" className={imageClassNames} />
                        :
                        <div className="imgContainerHireUsPg position-relative w-80 h-100">
                            <Image src={imgPath} layout='fill' alt="Galactic_PolyMath_HireUs_Img" />
                        </div>
                    }
                </section>
            }
            {link &&
                <section className={imgMainSectionClassNames}>
                    <div className="imgSquareContainer position-relative borderThicker">
                        <Image src={imgPath} layout='fill' alt="Galactic_PolyMath_HireUs_Img" />
                    </div>
                </section>
            }
        </section>
    )
}

export default PicAndImageSec;