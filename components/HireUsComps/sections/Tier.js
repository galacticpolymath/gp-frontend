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

const { Img, Body, Header } = Card;

const Tier = ({ tier, isNoBackground }) => {
    const { img, tierName, description, productInfo, estimatedPrice } = tier;
    const { low, high } = estimatedPrice;
    const { paragraph1, paragraph2 } = description
    const { learningExperience, projectSupport, vid, isMajorExtension, example } = productInfo;
    const { basic, complex } = vid ?? {};
    const { productImg, txt, link } = example;

    return (
        <Card className={`${isNoBackground ? 'noBackground noBorder' : 'tierCard shadow pt-5'} mt-5 pb-5 ps-sm-3 pe-sm-3`}>
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
                                    <td className="tierInfoStatus text-center text-sm-start fs-large">{learningExperience}</td>
                                    <td className="fs-large fst-italic fw200 ps-4 ps-sm-5 text-center text-sm-start">GP Learning Experience</td>
                                </tr>
                                <tr className="tierTableRow">
                                    <td className="w-25 tierInfoStatus text-center text-sm-start fs-large">{projectSupport}</td>
                                    <td className="w-75 fs-large fst-italic fw200 ps-4 ps-sm-5 text-center text-sm-start">Years of Project Support</td>
                                </tr>
                                <tr className="tierTableRow">
                                    <td className="w-25 tierInfoStatus text-center text-sm-start fs-large">{basic ? `${basic} secs` : <HiOutlineX />}</td>
                                    <td className="w-75 fs-large fst-italic fw200 ps-4 ps-sm-5 text-center text-sm-start">Basic Video</td>
                                </tr>
                                <tr className="tierTableRow">
                                    <td className="w-25 tierInfoStatus text-center text-sm-start fs-large">{complex ? `${complex} secs` : <HiOutlineX />}</td>
                                    <td className="w-75 fs-large fst-italic fw200 ps-4 ps-sm-5 text-center text-sm-start">Complex Video</td>
                                </tr>
                                <tr className="tierTableRow">
                                    <td className="w-25 tierInfoStatus text-center text-sm-start fs-large">{isMajorExtension ? <GoCheck /> : <HiOutlineX />}</td>
                                    <td className="w-75 fs-large fst-italic fw200 ps-4 ps-sm-5 text-center text-sm-start">Major extension in Year 3</td>
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
