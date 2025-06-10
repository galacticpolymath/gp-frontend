/* eslint-disable react/jsx-key */
/* eslint-disable no-undef */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable curly */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable no-console */
import { useRouter } from "next/router";
import LiNavDot from "./NavDots/LiNavDot";
import { useState, useEffect } from "react";
import ClickMeArrow from "../ClickMeArrow";
import throttle from "lodash.throttle";
import { ISectionDots, TSetter, TUseStateReturnVal } from "../../types/global";

interface IProps {
  _sectionDots: TUseStateReturnVal<ISectionDots>;
  setIsScrollListenerOn: TSetter<boolean>;
  isScrollListenerOn: boolean;
}

const LessonsSecsNavDots = ({
  _sectionDots,
  setIsScrollListenerOn,
  isScrollListenerOn,
}: IProps) => {
  const [sectionDots, setSectionDots] = _sectionDots;
  console.log("sectionDots: ", sectionDots);
  const [targetSec, setTargetSec] = useState<null | {
    element: HTMLElement;
    id: string;
  }>(null);
  const [willScrollElemIntoView, setWillScrollElemIntoView] = useState(false);
  const [arrowContainer, setArrowContainer] = useState({
    isInView: true,
    canTakeOffDom: false,
  });
  const router = useRouter();

  const handleMouseEnter = () => {
    console.log("yo there meng, handleMouseEnter");
    setArrowContainer({ isInView: false, canTakeOffDom: true });

    setSectionDots((sectionDots) => {
      return {
        ...sectionDots,
        dots: sectionDots.dots.map((sectionDot) => {
          return {
            ...sectionDot,
            willShowTitle: true,
          };
        }),
      };
    });
  };

  const handleMouseLeave = () => {
    console.log("sup there, handleMouseLeave");
    setSectionDots((sectionDots) => {
      return {
        ...sectionDots,
        dots: sectionDots.dots.map((sectionDot) => {
          return {
            ...sectionDot,
            willShowTitle: false,
          };
        }),
      };
    });
  };

  const scrollSectionIntoView = (sectionId: string) => {
    const targetSection = document.getElementById(sectionId);

    if (targetSection) {
      setTargetSec({ element: targetSection, id: sectionId });
    }
  };

  useEffect(() => {
    const overviewSection = sectionDots.dots.find(
      ({ sectionTitleForDot }) =>
        sectionTitleForDot.toLowerCase() === "overview"
    );

    if (!overviewSection?.isInView && arrowContainer.isInView) {
      setArrowContainer({ isInView: false, canTakeOffDom: false });
    }
  }, [sectionDots]);

  useEffect(() => {
    let url = router.asPath;

    if (targetSec && url.indexOf("#")) {
      targetSec.element.scrollIntoView({
        behavior: "smooth",
        block: targetSec.id === "lessonTitleId" ? "center" : "start",
      });
      setTargetSec(null);
      window.history.replaceState(null, "", url.split("#")[0]);
    } else if (targetSec) {
      targetSec.element.scrollIntoView({
        behavior: "smooth",
        block: targetSec.id === "lessonTitleId" ? "center" : "start",
      });
      setTargetSec(null);
    }
  }, [targetSec]);

  let timerForHandleDotClick: NodeJS.Timeout;

  const handleDotClick = (sectionId: string) => {
    console.log("handleDotClick, yo there!");
    clearTimeout(timerForHandleDotClick);
    timerForHandleDotClick = setTimeout(() => {
      setSectionDots((sectionDots) => ({
        clickedSectionId: sectionId,
        dots: sectionDots.dots.map((dot) => {
          if (dot.sectionDotId === `sectionDot-${sectionId}`) {
            return {
              ...dot,
              isInView: true,
            };
          }
          return {
            ...dot,
            isInView: false,
          };
        }),
      }));
      setIsScrollListenerOn(true);
    }, 1300);
    setIsScrollListenerOn(false);
    setWillScrollElemIntoView(true);
    setSectionDots((sectionDots) => {
      return {
        ...sectionDots,
        clickedSectionId: sectionId,
        dots: sectionDots.dots.map((sectionDot) => {
          return {
            ...sectionDot,
            willShowTitle: true,
          };
        }),
      };
    });
  };

  let timerForGoToSectionFn: NodeJS.Timeout;

  const goToSection = (sectionId: string) => {
    console.log("goToSection, yo there!");
    clearTimeout(timerForGoToSectionFn);
    timerForGoToSectionFn = setTimeout(() => {
      setSectionDots((sectionDots) => {
        return {
          clickedSectionId: sectionId,
          dots: sectionDots.dots.map((dot) => {
            if (dot.sectionDotId === `sectionDot-${sectionId}`) {
              return {
                ...dot,
                isInView: true,
              };
            }

            return {
              ...dot,
              isInView: false,
            };
          }),
        };
      });
      setIsScrollListenerOn(true);
    }, 950);
    setIsScrollListenerOn(false);
    setWillScrollElemIntoView(true);
    setSectionDots((sectionDots) => ({
      clickedSectionId: sectionId,
      dots: sectionDots.dots.map((dot) => {
        if (dot.sectionDotId === `sectionDot-${sectionId}`) {
          return {
            ...dot,
            isInView: true,
          };
        }

        return {
          ...dot,
          isInView: false,
        };
      }),
    }));
  };

  useEffect(() => {
    if (willScrollElemIntoView && sectionDots.clickedSectionId) {
      scrollSectionIntoView(sectionDots.clickedSectionId);
      setWillScrollElemIntoView(false);
    }
  }, [willScrollElemIntoView, isScrollListenerOn]);

  const liNavDotFns = { goToSection, handleDotClick, setSectionDots };
  let elementVisibililtyTimer: NodeJS.Timeout;

  const handleElementVisibility = (inViewPort: boolean) =>
    throttle(() => {
      clearTimeout(elementVisibililtyTimer);

      if (inViewPort) {
        setArrowContainer((state) => ({ ...state, isInView: true }));

        elementVisibililtyTimer = setTimeout(() => {
          setArrowContainer((state) => ({ ...state, isInView: false }));
        }, 3500);
      }
    }, 200)();

  return (
    <div
      style={{ transform: "translateY(8%)" }}
      className="position-fixed lessonSecsNavDotsListContainer d-flex"
    >
      {/* for devices larger than 992px */}
      <ul
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="ps-0 d-none d-lg-flex flex-column position-relative justify-content-center align-items-center h-100"
        style={{
          transform: "translate3d(0px, 0px, 0px)",
          transitionDuration: "3500ms",
          transition: "all .15s ease-in",
        }}
      >
        {sectionDots.dots.map((section, index) => (
          <LiNavDot
            key={index}
            isScrollListenerOn={isScrollListenerOn}
            EnticementArrow={
              index === 0 ? (
                <ClickMeArrow
                  handleElementVisibility={handleElementVisibility}
                  willShowArrow={arrowContainer.isInView}
                  containerStyle={{
                    zIndex: 1000,
                    right: "40px",
                    bottom: "65px",
                    display: arrowContainer.canTakeOffDom ? "none" : "block",
                  }}
                  clickToSeeMoreStyle={{
                    fontSize: "clamp(17px, 2vw, 18px)",
                    transform: "translateY(10px)",
                    color: "black",
                  }}
                >
                  <>Skip to Section</>
                </ClickMeArrow>
              ) : undefined
            }
            fns={liNavDotFns}
            section={section}
            index={index}
            isOnDesktop
          />
        ))}
      </ul>
      {/* for devices smaller than 991px */}
      <ul
        className="ps-0 d-flex d-lg-none flex-column position-relative justify-content-center align-items-center h-100"
        style={{
          transform: "translate3d(0px, 0px, 0px)",
          transitionDuration: "3500ms",
          transition: "all .15s ease-in",
        }}
      >
        {sectionDots.dots.map((section, index) => (
          <LiNavDot
            isScrollListenerOn={isScrollListenerOn}
            key={index}
            fns={liNavDotFns}
            section={section}
            index={index}
            isOnDesktop={false}
          />
        ))}
      </ul>
    </div>
  );
};

export default LessonsSecsNavDots;
