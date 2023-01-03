/* eslint-disable brace-style */
/* eslint-disable no-console */
/* eslint-disable @next/next/no-document-import-in-page */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable semi */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable prefer-template */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

// import { Head } from "next/document";
import { Card } from "react-bootstrap"
import { HiOutlineX } from "react-icons/hi"
import { GoCheck } from "react-icons/go"
import { AiOutlineQuestionCircle } from "react-icons/ai"

const { Img, Body, Header } = Card;

const Tier = ({ tier, isNoBackground, setTiersInfoForModalArr }) => {
    const { img, tierName, description, productInfo, estimatedPrice } = tier;
    const { low, high } = estimatedPrice;
    const { paragraph1, paragraph2 } = description
    const { learningExperience, projectSupport, vid, isMajorExtension, example } = productInfo;
    const { basic, complex } = vid ?? {};
    const { productImg, txt, link } = example;

    const handleTierFeatureTxtClick = event => {
        setTiersInfoForModalArr(tiersInfoForModalArr => tiersInfoForModalArr.map((tierInfo, index) => {
            if(index === parseInt(event.target.id)){
                console.log("opening modal")
                return {
                    ...tierInfo,
                    isModalOn: true
                }
            }

            return tierInfo;
        }))
    }


    return (
        <Card className={`${isNoBackground ? 'noBackground noBorder' : 'tierCard shadow pt-5 ms-2 me-2'} mt-5 pb-5 ps-sm-3 pe-sm-3`}>
            <Header className={`${isNoBackground ? 'noBackground noBorder' : 'tierCardBodyAndHeader noBorder'}`}>
                <section className="imgSectionTier d-flex justify-content-center justify-content-sm-start align-items-center align-items-sm-stretch">
                    <Img src={img} alt={`${tierName}_img`} className="w-25 tierImg" height={120} />
                </section>
                <section className="mt-4">
                    <h4 className="text-dark tierHeaderTag mt-2 fw450 fs-larger text-center text-sm-start">{tierName.toUpperCase()}</h4>
                </section>
            </Header>
            <Body className={`${isNoBackground ? 'noBackground' : 'tierCardBodyAndHeader'} noBorder pt-0`}>
                <section>
                    <p className="text-dark fst-italic fs-large fw200 text-sm-start text-center">{paragraph1}</p>
                    <p className="text-dark fst-italic fs-large fw200 mt-3 text-sm-start text-center">{paragraph2}</p>
                </section>
                <section>
                    <div className="tierProductBorder pt-2 pb-2">
                        <table className="productInfoTable w-100 noBorder">
                            <tbody>
                                <tr className="tierTableRow">
                                    <td className="tierInfoStatus text-center text-sm-end text-sm-nowrap fs-large">{learningExperience}</td>
                                    <td id="0" onClick={handleTierFeatureTxtClick} className="fs-large fst-italic fw200 ps-4 ps-sm-5 text-center text-sm-start position-relative">GP Learning Experience <AiOutlineQuestionCircle className="position-absolute questionMarkIcon" /> </td>
                                </tr>
                                <tr className="tierTableRow">
                                    <td className="w-25 tierInfoStatus text-center text-sm-end text-sm-nowrap fs-large">{projectSupport}</td>
                                    <td id="1" onClick={handleTierFeatureTxtClick} className="fs-large fst-italic fw200 ps-4 ps-sm-5 text-center text-sm-start position-relative">Years of Project Support <AiOutlineQuestionCircle className="position-absolute questionMarkIcon" /></td>
                                </tr>
                                <tr className="tierTableRow">
                                    <td className={`w-25 tierInfoStatus text-center text-sm-end text-sm-nowrap fs-large  ${basic ? '' : 'op-5'}`}>{basic ? `${basic} secs` : <HiOutlineX />}</td>
                                    <td id="2" onClick={handleTierFeatureTxtClick} className={`fs-large fst-italic fw200 ps-4 ps-sm-5 text-center text-sm-start position-relative ${basic ? '' : 'op-5'}`}>Basic Video <AiOutlineQuestionCircle className="position-absolute questionMarkIcon" /></td>
                                </tr>
                                <tr className="tierTableRow">
                                    <td className={`w-25 tierInfoStatus text-center text-sm-end text-sm-nowrap fs-large  ${complex ? '' : 'op-5'}`}>{complex ? `${complex} secs` : <HiOutlineX />}</td>
                                    <td id="3" onClick={handleTierFeatureTxtClick} className={`fs-large fst-italic fw200 ps-4 ps-sm-5 text-center text-sm-start position-relative ${complex ? '' : 'op-5'}`}>Complex Video <AiOutlineQuestionCircle className="position-absolute questionMarkIcon" /></td>
                                </tr>
                                <tr className="tierTableRow">
                                    <td className={`w-25 tierInfoStatus text-center text-sm-end text-sm-nowrap fs-large  ${isMajorExtension ? '' : 'op-5'}`}>{isMajorExtension ? <GoCheck /> : <HiOutlineX />}</td>
                                    <td id="4" onClick={handleTierFeatureTxtClick} className={`fs-large fst-italic fw200 ps-4 ps-sm-5 text-center text-sm-start position-relative ${isMajorExtension ? '' : 'op-5'}`}>Major extension in Year 3 <AiOutlineQuestionCircle className="position-absolute questionMarkIcon" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
                <section className="mt-4">
                    <section className="mt-2">
                        <h4 className="text-dark fst-italic fs-large fw200 text-center text-sm-start">Example Product: </h4>
                    </section>
                    <section>
                        <div className="imgProductContainer">
                            <Img src={productImg} alt={`${tierName}_ProductImg`} className="w-100 w-sm-90" height={170} />
                        </div>
                        <section className="mt-4 text-sm-start text-center">
                            <a href={link} target="_blank" className="text-dark text-decoration-underline fs-large fst-italic fw200 underline-less-thick">
                                "{txt}"
                            </a>
                        </section>
                    </section>
                </section>
                <section className="mt-5 w-100 d-flex justify-content-center align-items-center  justify-content-sm-start align-items-sm-stretch">
                    <h4 className="text-dark fst-italic fs-large text-center text-sm-start">
                        <span className="d-none d-sm-inline">
                            Estimated Price: ${low} - ${high}
                        </span>
                        <span className="d-block d-sm-none w-100 text-center">
                            Estimated Price:
                        </span>
                        <span className="d-flex flex-column d-sm-none w-100 text-center mt-2 pt-1">
                            <span>
                                ${low}
                            </span>
                            -
                            <span>
                                ${high}
                            </span>
                        </span>
                    </h4>
                </section>
            </Body>
        </Card>
    )
}

export default Tier;
