/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-curly-brace-presence */
 
/* eslint-disable comma-dangle */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable quotes */
/* eslint-disable semi */
 
 
 
 
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import PicAndDescriptionSec from './PicAndDescriptionSec';

const SCIENTISTS = [
    {
        "name": "Stephanie Castillo, PhD",
        "description": "Award-winning science communicator and video producer.",
        "src": "/imgs/profilePics/Stephanie.jpeg",
        "alt": "Galactic_Polymath_We_Work_With"
    },
    {
        "name": "Aarati Asundi, PhD",
        "description": "A scientist, entrepreneur and storyteller specializing in hand-drawn animation.",
        "src": "/imgs/profilePics/aarati.jpg",
        "alt": "Galactic_Polymath_We_Work_With"
    },
    {
        "name": "Madelyn Leembruggen",
        "description": "Harvard PhD candidate in physics, science communicator, and education consultant.",
        "src": "/imgs/profilePics/madelyn_sm.jpg",
        "alt": "Galactic_Polymath_We_Work_With"
    },
]

const ScientistSection = () => (
    <section className="scientistSection">
        <section className="d-block">
            <section className="w-100 d-flex justify-content-center align-items-center justify-content-md-start align-items-md-stretch mt-5 mb-5 mb-md-3 mb-xl-5 ps-md-5 pe-md-5 ms-md-5 me-md-5 pt-md-5">
                <h5 className="text-dark display-6 w-75">
                    Some of the many talented scientists, communicators, educators, and artists we work with:
                </h5>
            </section>
        </section>
        <section className="d-flex justify-content-center align-items-center justify-content-md-start align-items-md-stretch ps-md-5 pe-md-5 ms-md-5 me-md-5 pb-md-5 pb-xl-5">
            <section className="d-flex d-md-block flex-column flex-md-row justify-content-center justify-content-md-start scientistSec">
                {SCIENTISTS.map((scientist, index) => {
                    const { alt, src, name, description } = scientist;

                    return (
                        <PicAndDescriptionSec
                            key={index}
                            imgPath={src}
                            text={description}
                            name={name}
                            alt={alt}
                            parentSecStyles={`secWithHumanPic scientist d-md-inline-flex`}
                        />
                    )
                })}
            </section>
        </section>
    </section>
)


export default ScientistSection;
