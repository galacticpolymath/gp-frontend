 
 
 
 
 
/* eslint-disable react/no-unescaped-entities */
 
 
 
 
 
 
 
 
 
 
 
 
 


const AutoCarouselItem = ({ itemCarouselStylesCustom, index, feedbackSecClassNames, feedBackClassName, carouselItem, quoteInfo }) => {
    let autoCarouselItemStyles = "autoCarouselItem position-relative"
    const { feedback, occupation, city, location, institution, product, person, cssClass, stars } = carouselItem

    if (itemCarouselStylesCustom) {
        autoCarouselItemStyles += ' ' + itemCarouselStylesCustom
    }

    if (cssClass) {
        autoCarouselItemStyles += ' ' + cssClass
    }

    return (
        <div className={autoCarouselItemStyles} key={index}>
            <section className={feedbackSecClassNames}>
                {stars &&
                    <span className="text-dark fst-italic fw275 productReviewTxt d-none d-sm-inline">
                        {`⭐ ${stars}/5`} stars {<>for '<i>{product}</i>':</>}
                    </span>}
                <section className={feedBackClassName}>
                    <span className="text-dark fst-italic text-center text-sm-start feedbackTxt fw275">
                        "{feedback}"
                    </span>
                </section>
                <section className={quoteInfo}>
                    <section className='flex-column d-flex justify-content-center justify-content-sm-start align-items-center align-items-sm-stretch'>
                        <span className="text-wrap text-center text-sm-start text-dark feedBackTxtName fst-italic fw275">- {person}</span>
                        {(!!occupation || !!institution) && <span className="text-wrap text-dark fst-italic fw275">{occupation ?? institution}</span>}
                        {(!!city || !!location) && <span className="text-wrap text-dark fst-italic fw275">{city ?? location}</span>}
                        {!!stars && <span className="text-dark productReviewTxt w-100 text-center fst-italic fw275 d-block d-sm-none">
                            {`⭐ ${stars}/5`} stars {<>for '<i>{product}</i>'</>}
                        </span>}
                    </section>
                </section>
            </section>
        </div>
    )
}

export default AutoCarouselItem;