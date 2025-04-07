/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import PropTypes from "prop-types";
import { useRef } from "react";
import useLessonElementInView from "../../../customHooks/useLessonElementInView";
import CollapsibleLessonSection from "../../CollapsibleLessonSection";
import LessonsCarousel from "./LessonsCarousel";
import { ISectionDots, TUseStateReturnVal } from "../../../types/global";
import { INewUnitSchema } from "../../../backend/models/Unit/types/unit";

interface IPreviewProps {
  _sectionDots: TUseStateReturnVal<ISectionDots>;
  SectionTitle: string;
  Multimedia: INewUnitSchema["FeaturedMultimedia"];
  InitiallyExpanded: boolean;
}

const Preview = (props: IPreviewProps) => {
  console.log("preview props, yo there: ", props);
  const { SectionTitle, InitiallyExpanded, Multimedia, _sectionDots } = props;
  const ref = useRef(null);

  useLessonElementInView(_sectionDots, SectionTitle, ref);

  return (
    <CollapsibleLessonSection
      SectionTitle={SectionTitle}
      SectionTitleId="unit-preview-id"
      initiallyExpanded={InitiallyExpanded !== false}
      _sectionDots={_sectionDots}
    >
      <div
        id="unit-preview-container"
        ref={ref}
        className="row mx-auto pb-4 justify-content-center pt-4"
      >
        {Multimedia?.length && <LessonsCarousel mediaItems={Multimedia} />}
      </div>
    </CollapsibleLessonSection>
  );
};

Preview.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
  InitiallyExpanded: PropTypes.bool,
  Multimedia: PropTypes.arrayOf(PropTypes.object),
  QuickPrep: PropTypes.string,
};

export default Preview;
