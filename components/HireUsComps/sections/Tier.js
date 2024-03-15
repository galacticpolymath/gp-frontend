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
import { useEffect, useState } from 'react'

const { Body, Header } = Card;

const Tier = ({ tier, isNoBackground, setTiersInfoForModalArr, index }) => {
    const [didInitialRenderOccur, setDidInitialRenderOccur] = useState(false);
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

    useEffect(() => {
        setDidInitialRenderOccur(true)
    }, [])

    return (
        <Card className={`${isNoBackground ? 'noBackground noBorder' : 'tierCard shadow pe-lg-3 ps-lg-3 pe-xl-0 ps-xl-0 pt-5 ms-xl-2 me-xl-2 me-md-0 me-xl-2 pt-md-1'} ps-lg-3 pe-lg-3  mt-5 pb-5 px-xs-1 ps-md-0 pe-md-0  ${index !== 0 ? '' : ''}`}>
            <Header className={`${isNoBackground ? 'noBackground noBorder' : 'noBackground noBorder'}`}>
                <section className="col d-grid justify-content-center pt-4">

                    <div className="position-relative mb-2 mx-auto" style={{ height: "90px", width: "90px" }}>
                        <Image
                            src={img}
                            alt={`${tierName}_img`}
                            className='teirImg'
                            fill
                            sizes="90px"
                        />
                    </div>
                    <h5 className="text-dark fw450 text-center mb-0">{tierName.toUpperCase()}</h5>
                </section>
            </Header>
            <Body className={`${isNoBackground ? 'noBackground' : ''} noBorder pt-0 position-relative tierCardBody d-flex flex-column`}>
                <p className="text-dark  text-center">{paragraph1}</p>
                <section>
                    <div className="tierProductBorder py-1 py-lg-3">
                        {didInitialRenderOccur && <table className="productInfoTable w-100 noBorder">
                            <tbody className='d-grid justify-content-center pe-1'>
                                <div className="col">
                                    <tr className="tierTableRow">
                                        <td className="tierInfoStatus ps-0 ps-sm-0 text-sm-end text-sm-nowrap">{learningExperience}</td>
                                        <td id="0" onClick={handleTierFeatureTxtClick} className="fst-italic fw200 ps-3 position-relative underline-on-hover">
                                            Learning Experience
                                            <AiOutlineQuestionCircle style={{ marginLeft: ".4rem" }} className="position-absolute questionMarkIcon" />
                                        </td>
                                    </tr>
                                    <tr className="tierDetails">
                                        <td className="w-20 tierInfoStatus ps-0 ps-sm-0 text-end text-sm-nowrap ">{projectSupport}</td>
                                        <td id="1" onClick={handleTierFeatureTxtClick} className="fst-italic fw200 ps-3 text-sm-start position-relative underline-on-hover">Year(s) of Support <AiOutlineQuestionCircle style={{ marginLeft: ".4rem" }} className="position-absolute questionMarkIcon" /></td>
                                    </tr>
                                    <tr className="tierDetails">
                                        <td className={`w-20 tierInfoStatus ps-0 ps-sm-0 text-end text-sm-nowrap   ${basic ? '' : 'op-5'}`}>{basic ? `${basic} min` : <HiOutlineX />}</td>
                                        <td id="2" onClick={handleTierFeatureTxtClick} className={`fst-italic fw200 ps-3 text-sm-start position-relative underline-on-hover ${basic ? '' : 'op-5'}`}>Basic Video <AiOutlineQuestionCircle style={{ marginLeft: ".4rem" }} className="position-absolute questionMarkIcon" /></td>
                                    </tr>
                                    <tr className="tierDetails">
                                        <td className={`w-20 tierInfoStatus ps-0 ps-sm-0 text-end text-sm-nowrap   ${complex ? '' : 'op-5'}`}>{complex ? `${complex} min` : <HiOutlineX />}</td>
                                        <td id="3" onClick={handleTierFeatureTxtClick} className={`fst-italic fw200 ps-3 text-sm-start position-relative underline-on-hover ${complex ? '' : 'op-5'}`}>Complex Video <AiOutlineQuestionCircle style={{ marginLeft: ".4rem" }} className="position-absolute questionMarkIcon" /></td>
                                    </tr>
                                    <tr className="tierDetails">
                                        <td className={`w-20 tierInfoStatus ps-0 ps-sm-0 text-end text-sm-nowrap   ${isMajorExtension ? '' : 'op-5'}`}>{isMajorExtension ? <GoCheck /> : <HiOutlineX />}</td>
                                        <td id="4" onClick={handleTierFeatureTxtClick} className={`fst-italic fw200 ps-3 text-sm-start position-relative underline-on-hover ${isMajorExtension ? '' : 'op-5'}`}>Major Extension <AiOutlineQuestionCircle style={{ marginLeft: ".4rem" }} className="position-absolute questionMarkIcon" /></td>
                                    </tr>
                                </div>
                            </tbody>

                        </table>}
                    </div>
                </section>
                <section className="mt-2 d-grid container-fluid">
                    <div className="row justify-content-center ">
                        <div className="col-12 col-md-6 col-lg-12">
                            <div className="text-dark fst-italic fs-big text-sm-start ">Example Product: </div>
                            <section className="productSec ">
                                <div className="position-relative pointer">
                                    <Image
                                        src={productImg}
                                        width={1500}
                                        height={450}
                                        alt={`${tierName}_ProductImg`}
                                        onClick={handleImgClick}
                                        style={{ width: "100%", maxWidth: "500px", height: "auto", objectFit: 'contain' }}
                                    />
                                </div>
                                <section className="mt-1">
                                    <a href={link} target="_blank" className="fs-6 fst-italic ">
                                        <span>&#8220;{txt}&#8221;</span>
                                    </a>
                                </section>
                            </section>
                            <div className="pt-3 text-dark fst-italic  text-sm-start">
                                <span>Starting At: ${low}</span>
                            </div>
                        </div>
                    </div>
                </section>
            </Body>
        </Card>
    )
}

export default Tier;
