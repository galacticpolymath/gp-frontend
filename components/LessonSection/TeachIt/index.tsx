/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable indent */

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  ReactNode,
  CSSProperties,
} from "react";
import PropTypes from "prop-types";
import useLessonElementInView from "../../../customHooks/useLessonElementInView";
import Image from "next/image";
import Pill from "../../Pill";
import { TeachItProps } from "./types";
import {
  IItem,
  ILessonDetail,
  ILink,
  INewUnitLesson,
  IResource,
  ITeachingMaterialsDataForUI,
} from "../../../backend/models/Unit/types/teachingMaterials";
import { ILessonForUI } from "../../../types/global";
import TeachItUI, { THandleOnChange } from "./TeachItUI";

export const GRADE_VARIATION_ID = "gradeVariation";

export interface ILessonTileProps {
  lessonTileUrl: string;
  imgContainerClassNameStr?: string;
  imgStyle?: CSSProperties;
  imgContainerStyle?: CSSProperties;
  Pill?: ReactNode;
  id?: { id: string } | {};
}

const LessonTile = ({
  lessonTileUrl,
  imgContainerClassNameStr,
  imgStyle = { objectFit: "contain" },
  imgContainerStyle = { width: 150, height: 150 },
  Pill = null,
  id = {},
}: ILessonTileProps) => {
  return (
    <div style={imgContainerStyle} className={imgContainerClassNameStr}>
      {Pill}
      {lessonTileUrl && (
        <Image
          {...id}
          src={lessonTileUrl}
          alt="lesson_tile"
          fill
          style={imgStyle}
          sizes="130px"
          className="img-optimize rounded w-100 h-100"
        />
      )}
    </div>
  );
};

interface IDisplayLessonTileProps {
  status: string;
  imgContainerClassNameStr: string;
  lessonTileUrl: string;
  id?: { id: string };
}

export const DisplayLessonTile = ({
  status,
  imgContainerClassNameStr,
  lessonTileUrl,
  id,
}: IDisplayLessonTileProps) => {
  const tileId = id ? { id } : {};

  if (status === "Beta") {
    return (
      <LessonTile
        {...tileId}
        imgStyle={{ objectFit: "contain" }}
        lessonTileUrl={lessonTileUrl}
        imgContainerClassNameStr={`${imgContainerClassNameStr}`}
        Pill={<Pill zIndex={10} />}
      />
    );
  }

  return (
    <LessonTile
      {...tileId}
      imgStyle={{ objectFit: "contain", border: "solid 2px #C0BFC1" }}
      lessonTileUrl={lessonTileUrl}
      imgContainerClassNameStr={imgContainerClassNameStr}
    />
  );
};

const TeachIt = (props: TeachItProps) => {
  let {
    _sectionDots,
    SectionTitle,
    ForGrades,
    GradesOrYears,
    classroom,
    unitDur,
    unitPreface,
  } = props;
  let Data = props?.Data ?? props;
  const [, setSectionDots] = _sectionDots;
  const ref = useRef(null);

  useLessonElementInView(_sectionDots, SectionTitle, ref);

  const environments = useMemo(() => {
    const dataKeys = Data && typeof Data === "object" ? Object.keys(Data) : [];
    const environments = dataKeys.length
      ? (["classroom", "remote"] as const).filter((setting) =>
          dataKeys.includes(setting)
        )
      : [];

    return environments;
  }, []);
  let gradeVariations:
    | IResource<ILessonForUI>[]
    | undefined
    | IResource<INewUnitLesson<IItem>>[];

  if ("classroom" in Data) {
    gradeVariations = Data?.classroom?.resources ?? [];
  }

  // for the new schema
  const [unitLessonResources, setUnitLessonResources] = useState(
    classroom?.resources?.[0] ?? ({} as IResource<INewUnitLesson<IItem>>)
  );

  const [selectedEnvironment, setSelectedEnvironment] = useState(
    environments[0]
  );

  let allResources: IResource<ILessonForUI>[] = [];

  if (
    ("classroom" in Data || "remote" in Data) &&
    typeof (Data as ITeachingMaterialsDataForUI<ILessonForUI>)[
      selectedEnvironment
    ] === "object" &&
    (Data as ITeachingMaterialsDataForUI<ILessonForUI>)[selectedEnvironment] !=
      null &&
    (Data as ITeachingMaterialsDataForUI<ILessonForUI>)[selectedEnvironment]
      ?.resources?.length
  ) {
    allResources = (Data as ITeachingMaterialsDataForUI<ILessonForUI>)[
      selectedEnvironment
    ]?.resources as IResource<ILessonForUI>[];
  }
  const [selectedGradeResources, setSelectedGradeResources] = useState(
    allResources?.[0]?.links ?? ({} as ILink)
  );
  const handleOnChangeForNewUnitResources = (
    selectedGrade: IResource<INewUnitLesson>
  ) => {
    setSelectedGradeResources(selectedGrade.links as ILink);
    setUnitLessonResources(selectedGrade);
  };
  // the above is based on the new schema

  // TODO: will cease to be used when the new schema is implemented
  const [selectedGrade, setSelectedGrade] = useState(
    gradeVariations?.length
      ? gradeVariations[0]
      : ({} as IResource<ILessonForUI>)
  );
  const handleOnChange = (selectedGrade: IResource<ILessonForUI>) => {
    setSelectedGradeResources(selectedGrade.links as ILink);
    setSelectedGrade(selectedGrade);
  };
  // The above will be ceased to be used when the new schema is implemented

  let resources = allResources?.length
    ? allResources.find(
        ({ gradePrefix }) => gradePrefix === selectedGrade.gradePrefix
      )
    : ({} as IResource);

  let areThereMoreThan1Resource = false;

  if (
    "classroom" in Data &&
    Data.classroom?.resources?.length &&
    Data.classroom?.resources?.length > 1
  ) {
    areThereMoreThan1Resource = true;
  }

  ForGrades = areThereMoreThan1Resource ? selectedGrade.grades : ForGrades;
  let dataLesson: ILessonDetail[] = [];

  if ("lesson" in Data) {
    dataLesson = Data.lesson;
  }

  let parts = selectedGrade.lessons ?? [];

  useEffect(() => {
    const lessonPartPath = window.location.href.split("#").at(-1);
    let lessonPartNum: number | null = null;

    if (
      typeof lessonPartPath === "string" &&
      typeof lessonPartPath.split("_").at(-1) === "string"
    ) {
      const lessonPartNumRetrieved = lessonPartPath.split("_").at(-1) as string;
      lessonPartNum = Number.parseInt(lessonPartNumRetrieved);
    }

    if (
      lessonPartPath &&
      lessonPartPath.includes("lesson_part_") &&
      typeof lessonPartNum === "number" &&
      parts.length >= 0 &&
      lessonPartNum > 0
    ) {
      setSectionDots((sectionDotsObj) => ({
        ...sectionDotsObj,
        dots: sectionDotsObj.dots.map((dot) => {
          if (dot.sectionTitleForDot === "Teaching Materials") {
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
    }
  }, []);

  if (!Data) {
    return <div>No lessons to display.</div>;
  }

  return "lessonDur" in Data ? (
    <TeachItUI<ILessonForUI, IResource<ILessonForUI>>
      ref={ref}
      ForGrades={ForGrades}
      lessonDur={Data.lessonDur}
      lessonPreface={Data.lessonPreface}
      SectionTitle={SectionTitle}
      _sectionDots={_sectionDots}
      selectedGrade={selectedGrade as IResource<ILessonForUI>}
      gradeVariations={gradeVariations}
      handleOnChange={handleOnChange as THandleOnChange<ILessonForUI>}
      environments={environments}
      selectedEnvironment={selectedEnvironment}
      setSelectedEnvironment={setSelectedEnvironment}
      selectedGradeResources={selectedGradeResources}
      parts={parts}
      dataLesson={dataLesson}
      GradesOrYears={GradesOrYears}
      resources={resources}
    />
  ) : (
    <TeachItUI<INewUnitLesson, IResource<ILessonForUI>>
      ref={ref}
      ForGrades={ForGrades}
      lessonDur={unitDur}
      lessonPreface={unitPreface}
      SectionTitle={SectionTitle}
      _sectionDots={_sectionDots}
      selectedGrade={selectedGrade as IResource<ILessonForUI>}
      gradeVariations={classroom?.resources}
      handleOnChange={handleOnChangeForNewUnitResources}
      environments={environments}
      selectedEnvironment={selectedEnvironment}
      setSelectedEnvironment={setSelectedEnvironment}
      selectedGradeResources={selectedGradeResources}
      parts={unitLessonResources.lessons ?? []}
      dataLesson={dataLesson}
      GradesOrYears={GradesOrYears}
      resources={resources}
    />
  );
};

TeachIt.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
  Data: PropTypes.object,
};

export default TeachIt;
