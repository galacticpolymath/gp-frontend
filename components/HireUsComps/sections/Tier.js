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

import Image from 'next/image';
import { Card } from "react-bootstrap"
import { HiOutlineX } from "react-icons/hi"
import { GoCheck } from "react-icons/go"
import { AiOutlineQuestionCircle } from "react-icons/ai"

const { Img, Body, Header } = Card;

const Tier = ({ tier, isNoBackground, setTiersInfoForModalArr, index }) => {
    const { img, tierName, description, productInfo, estimatedPrice } = tier;
    const { low, high } = estimatedPrice;
    const { paragraph1, paragraph2 } = description
    const { learningExperience, projectSupport, vid, isMajorExtension, example } = productInfo;
    const { basic, complex } = vid ?? {};
    const { productImg, txt, link } = example;

    const handleTierFeatureTxtClick = event => {
        setTiersInfoForModalArr(tiersInfoForModalArr => tiersInfoForModalArr.map((tierInfo, index) => {
            const _id = event.target.id || event.target.parentElement.id

            if (index === parseInt(_id)) {
                return {
                    ...tierInfo,
                    isModalOn: true
                }
            }

            return tierInfo;
        }))
    }

    const handleImgClick = () => {
        window.open(link, "_")
    }

    // ps-md-5 pe-md-5
    // ms-xl-3 me-xl-3
    return (
        <Card className={`${isNoBackground ? 'noBackground noBorder' : 'tierCard shadow pe-lg-3 ps-lg-3 pe-xl-0 ps-xl-0 pt-5 ms-xl-2 me-xl-2 me-md-0 me-xl-2 pt-md-1'} ps-lg-3 pe-lg-3  mt-5 pb-5 ps-sm-5 pe-sm-5 ps-md-0 pe-md-0 tierDefaultStyles ${index !== 0 ? '' : ''}`}>
            <Header className={`${isNoBackground ? 'noBackground noBorder' : 'tierCardBodyAndHeader noBorder'}`}>
                <section className="imgSectionTier">
                    {/* <Img src={img} alt={`${tierName}_img`} className="tierImg" height={120} /> */}
                    <div className="position-relative" style={{ height: "120px", width: "120px" }}>
                        <Image
                            src={img}
                            alt={`${tierName}_img`}
                            className='teirImg'
                            fill
                            sizes="120px"
                        />
                    </div>
                </section>
                <section className="mt-4">
                    <h4 className="text-dark tierHeaderTag mt-2 fw450 text-sm-start">{tierName.toUpperCase()}</h4>
                </section>
            </Header>
            <Body className={`${isNoBackground ? 'noBackground' : 'tierCardBodyAndHeader'} noBorder pt-0 position-relative tierCardBody d-flex flex-column`}>
                <section className="tierParagraphSec">
                    <p className="text-dark fst-italic  fw200 text-sm-start">{paragraph1}</p>
                    <p className="text-dark fst-italic  fw200 mt-3 text-sm-start">{paragraph2}</p>
                </section>
                <section>
                    <div className="tierProductBorder pt-2 pb-2 pt-md-3 pb-md-3">
                        <table className="productInfoTable w-100 noBorder">
                            <tbody>
                                <tr className="tierTableRow">
                                    <td className="tierInfoStatus ps-2 ps-sm-0 text-start text-sm-end text-sm-nowrap">{learningExperience}</td>
                                    <td id="0" onClick={handleTierFeatureTxtClick} className="fst-italic fw200 ps-sm-5 text-sm-start position-relative underline-on-hover">
                                        GP Learning Experience
                                        <AiOutlineQuestionCircle style={{ marginLeft: ".4rem" }} className="position-absolute questionMarkIcon" />
                                    </td>
                                </tr>
                                <tr className="tierTableRow">
                                    <td className="w-25 tierInfoStatus ps-2 ps-sm-0 text-start text-sm-end text-sm-nowrap ">{projectSupport}</td>
                                    <td id="1" onClick={handleTierFeatureTxtClick} className="fst-italic fw200 ps-sm-5 text-sm-start position-relative underline-on-hover">Years of Project Support <AiOutlineQuestionCircle style={{ marginLeft: ".4rem" }} className="position-absolute questionMarkIcon" /></td>
                                </tr>
                                <tr className="tierTableRow">
                                    <td className={`w-25 tierInfoStatus ps-2 ps-sm-0 text-start text-sm-end text-sm-nowrap   ${basic ? '' : 'op-5'}`}>{basic ? `${basic} min` : <HiOutlineX />}</td>
                                    <td id="2" onClick={handleTierFeatureTxtClick} className={`fst-italic fw200 ps-sm-5 text-sm-start position-relative underline-on-hover ${basic ? '' : 'op-5'}`}>Basic Video <AiOutlineQuestionCircle style={{ marginLeft: ".4rem" }} className="position-absolute questionMarkIcon" /></td>
                                </tr>
                                <tr className="tierTableRow">
                                    <td className={`w-25 tierInfoStatus ps-2 ps-sm-0 text-start text-sm-end text-sm-nowrap   ${complex ? '' : 'op-5'}`}>{complex ? `${complex} min` : <HiOutlineX />}</td>
                                    <td id="3" onClick={handleTierFeatureTxtClick} className={`fst-italic fw200 ps-sm-5 text-sm-start position-relative underline-on-hover ${complex ? '' : 'op-5'}`}>Complex Video <AiOutlineQuestionCircle style={{ marginLeft: ".4rem" }} className="position-absolute questionMarkIcon" /></td>
                                </tr>
                                <tr className="tierTableRow">
                                    <td className={`w-25 tierInfoStatus ps-2 ps-sm-0 text-start text-sm-end text-sm-nowrap   ${isMajorExtension ? '' : 'op-5'}`}>{isMajorExtension ? <GoCheck /> : <HiOutlineX />}</td>
                                    <td id="4" onClick={handleTierFeatureTxtClick} className={`fst-italic fw200 ps-sm-5 text-sm-start position-relative underline-on-hover ${isMajorExtension ? '' : 'op-5'}`}>Major extension in Year 3 <AiOutlineQuestionCircle style={{ marginLeft: ".4rem" }} className="position-absolute questionMarkIcon" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
                <section className="mt-2">
                    <section className="mt-2">
                        <h4 className="text-dark fst-italic  fw200 text-sm-start exampleProductTxt">Example Product: </h4>
                    </section>
                    <section className="productSec">
                        <div className={`imgProductContainer position-relative pointer ${tierName}_style`} style={{ height: 170 }}>
                            <Image
                                src={productImg}
                                fill
                                alt={`${tierName}_ProductImg`}
                                onClick={handleImgClick}
                                style={{ objectFit: 'contain' }}
                                sizes="(max-width: 575px) 490px, (max-width: 767px) 567px, (max-width: 991px) 504px, 24vw"
                            />
                        </div>
                        <section className="mt-4 text-sm-start">
                            <a href={link} target="_blank" className="text-dark text-decoration-underline  fst-italic fw200 underline-less-thick">
                                &quot;{txt}&quot;
                            </a>
                        </section>
                    </section>
                </section>
                <div style={{ height: 100 }} className='d-none d-sm-block' />
                <div style={{ height: 50 }} className='d-block d-sm-none' />
                <section className="mt-md-5 w-100 d-flex justify-content-start align-items-stretch align-self-end priceSection">
                    <h4 className="text-dark fst-italic  text-sm-start">
                        <section className="d-flex flex-row flex-sm-column priceTxtHorizontal">
                            <span>Estimated Price: </span>
                            <span className="ms-2 mt-sm-3 priceTxt">${low} - ${high}</span>
                        </section>
                    </h4>
                </section>
            </Body>
        </Card>
    )
}

export default Tier;
