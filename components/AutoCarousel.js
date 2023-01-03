/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-tag-spacing */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable brace-style */
/* eslint-disable comma-dangle */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import { BsCircle, BsCircleFill } from 'react-icons/bs';
import { Card } from "react-bootstrap";
import { bull } from 'react-icons/tb';
import { useEffect, useRef, useState } from 'react';
import UserFeedBack from './HireUsComps/UserFeedBack';

const { Body } = Card;

const AutoCarousel = ({ userInputs }) => {
    const firstRenderRef = useRef(false);
    const _userInputsDisplayed = !firstRenderRef.current ? userInputs.map((userInput, index) => ({ ...userInput, willScrollIntoView: (index === 0) })) : userInputs;
    const [userInputsDisplayed, setUserInputsDisplayed] = useState(_userInputsDisplayed);
    const [intervalTimer, setIntervalTimer] = useState(null);
    firstRenderRef.current = true;

    function displayFeedbackByIndex(clickedCircleIndex) {
        setUserInputsDisplayed(userInputsDisplayed => {
            const _userInputsDisplayed = userInputsDisplayed.map((userInputDisplayed, index) => {
                return {
                    ...userInputDisplayed,
                    willScrollIntoView: (clickedCircleIndex === index)
                }
            })

            return _userInputsDisplayed;
        })
    }

    useEffect(() => {
        if(firstRenderRef.current){
            let _intervalTimer = setInterval(() => {
                const currentFeedbackDisplayedIndex = userInputsDisplayed.findIndex(({ willScrollIntoView }) => willScrollIntoView)
                const indexOfFeedbackToDisplay = ((currentFeedbackDisplayedIndex + 1) > (userInputs.length - 1)) ? 0 : (currentFeedbackDisplayedIndex + 1)
                displayFeedbackByIndex(indexOfFeedbackToDisplay)
            }, 3000);
            setIntervalTimer(intervalTimer)

            return () => { 
                clearInterval(_intervalTimer); 
                clearInterval(intervalTimer); 
            }
        }
    }, [userInputsDisplayed]);

    return (
        <Card className="w-75">
            <Body>
                <section className='row ps-5 pe-5 mt-5 pb-5'>
                    <div className="slider w-100">
                        <section className="d-flex justify-content-center align-items-center">
                            <div className="slides d-flex">
                                {userInputs.map((_, index) => (
                                    <div key={index}>
                                        {index + 1}
                                    </div>
                                ))}
                            </div>
                        </section>
                        {userInputsDisplayed.map(({ willScrollIntoView }, index) => (
                            willScrollIntoView ? 
                            <BsCircleFill
                                key={index} className="text-primary"/>
                            :
                            <BsCircle
                                key={index}
                                onClick={() => { displayFeedbackByIndex(index) }}
                            />
                            
                        ))}
                    </div>
                </section>
            </Body>
        </Card>
    )

}

export default AutoCarousel;