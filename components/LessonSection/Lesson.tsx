// import { ReactNode } from "react";
// import {
//   IItem,
//   ILessonDetail,
//   INewUnitLesson,
// } from "../../backend/models/Unit/types/teachingMaterials";
// import { DisplayLessonTile } from "./TeachIt";
// import LessonPart from "./TeachIt/LessonPart";

// interface IProps {
//   part: INewUnitLesson<IItem>;
//   dataLesson: ILessonDetail[];
//   lsnNum: number;
// }

// const Lesson: React.FC<IProps> = ({ part, dataLesson }) => {
//   let learningObjs: string[] | null = [];

//   if ("learningObj" in part) {
//     learningObjs = part.learningObj;
//   }

//   let { lsn, title, preface, itemList, tile, chunks } = part;
//   let targetLessonInDataLesson = null;

//   if (dataLesson?.length && dataLesson.every((val) => val !== null)) {
//     targetLessonInDataLesson = dataLesson.find(
//       ({ lsnNum }) => lsnNum != null && lsn != null && lsnNum == lsn
//     );
//     learningObjs = targetLessonInDataLesson?.learningObj ?? null;
//   }

//   let lsnExt = null;

//   if ("goingFurther" in part) {
//     lsnExt = part.goingFurther;
//   } else if (dataLesson?.length) {
//     const { lsnExt: lsnExtBackup } =
//       Object.values(dataLesson).find(({ lsnNum: lsnNumDataLesson }) => {
//         return (
//           lsnNumDataLesson &&
//           lsn != null &&
//           typeof lsn === "string" &&
//           !isNaN(Number(lsn)) &&
//           parseInt(lsn) == lsnNumDataLesson
//         );
//       }) ?? {};
//     lsnExt = lsnExtBackup;
//   }

//   let lessonTilesObj: {
//     lessonTileForDesktop: ReactNode | null;
//     lessonTileForMobile: ReactNode | null;
//   } = {
//     lessonTileForDesktop: null,
//     lessonTileForMobile: null,
//   };

//   if (
//     part &&
//     typeof part === "object" &&
//     "status" in part &&
//     typeof part.status === "string" &&
//     tile &&
//     typeof tile === "string"
//   ) {
//     lessonTilesObj = {
//       lessonTileForDesktop: (
//         <DisplayLessonTile
//           status={part.status}
//           imgContainerClassNameStr="d-none d-lg-block position-relative me-4"
//           lessonTileUrl={tile}
//           id={{ id: `${lsn}-tile` }}
//         />
//       ),
//       lessonTileForMobile: (
//         <DisplayLessonTile
//           status={part.status}
//           imgContainerClassNameStr="d-flex my-3 my-lg-0 d-lg-none position-relative"
//           lessonTileUrl={tile}
//         />
//       ),
//     };
//   }

//   return (
//     <LessonPart
//       {...lessonTilesObj}
//       GradesOrYears={GradesOrYears}
//       removeClickToSeeMoreTxt={removeClickToSeeMoreTxt}
//       key={`${index}_part`}
//       ClickToSeeMoreComp={
//         index === 0 ? (
//           <ClickMeArrow
//             handleElementVisibility={handleElementVisibility}
//             willShowArrow={arrowContainer.isInView}
//             containerStyle={{
//               zIndex: 1000,
//               bottom: "60px",
//               right: "50px",
//               display: arrowContainer.canTakeOffDom ? "none" : "block",
//             }}
//           >
//             <>
//               <Sparkles
//                 sparkleWrapperStyle={{
//                   height: 40,
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                 }}
//                 color="purple"
//               >
//                 <p style={{ transform: "translateY(20px)" }}>
//                   CLICK TO SEE MORE!
//                 </p>
//               </Sparkles>
//             </>
//           </ClickMeArrow>
//         ) : null
//       }
//       FeedbackComp={
//         part.status === "Beta" ? (
//           <SendFeedback
//             parentDivStyles={{
//               backgroundColor: "#EBD0FF",
//               zIndex: 100,
//               border: "1px solid #B7B6C2",
//             }}
//             CloseBtnComp={null}
//             txtSectionStyle={{ width: "100%" }}
//             txtSectionClassNameStr="px-sm-3 pt-1 pt-sm-0"
//             containerClassName="mt-3"
//           />
//         ) : null
//       }
//       partsArr={self}
//       resources={resources}
//       _numsOfLessonPartsThatAreExpanded={[
//         numsOfLessonPartsThatAreExpanded,
//         setNumsOfLessonPartsThatAreExpanded,
//       ]}
//       lsnNum={lsn}
//       lsnTitle={title}
//       lsnPreface={preface}
//       lsnExt={lsnExt}
//       chunks={
//         lsn !== ASSESSMENTS_ID ? targetLessonInDataLesson?.chunks ?? chunks : []
//       }
//       ForGrades={ForGrades}
//       learningObjectives={lsn !== ASSESSMENTS_ID ? learningObjs ?? [] : []}
//       partsFieldName="lessons"
//       itemList={itemList as IItemForClient[]}
//       isAccordionExpandable={part.status !== UNVIEWABLE_LESSON_STR}
//       accordionBtnStyle={
//         part.status === UNVIEWABLE_LESSON_STR ? { cursor: "default" } : {}
//       }
//       ComingSoonLessonEmailSignUp={
//         part.status === UNVIEWABLE_LESSON_STR ? (
//           <div className="w-100 px-2 my-2">
//             <SendFeedback
//               parentDivStyles={{
//                 backgroundColor: "#FFF4E2",
//                 zIndex: 100,
//                 border: "1px solid #B7B6C2",
//               }}
//               CloseBtnComp={null}
//               txtSectionStyle={{
//                 width: "100%",
//                 display: "flex",
//                 alignItems: "center",
//               }}
//               parentDivClassName="w-100 px-2 d-flex"
//               IconSectionForTxtDesktop={
//                 <section
//                   style={{ width: "2.5%", marginTop: "1.8px" }}
//                   className="h-100 d-none d-sm-flex pt-3 pt-sm-0 justify-content-sm-center align-items-sm-center"
//                 >
//                   <i
//                     style={{
//                       height: "fit-content",
//                       fontSize: "28px",
//                     }}
//                     className="bi bi-envelope-plus"
//                   />
//                 </section>
//               }
//               txt={
//                 <>
//                   <Link
//                     style={{ wordWrap: "break-word" }}
//                     className="no-link-decoration text-decoration-underline"
//                     href={SIGN_UP_FOR_EMAIL_LINK}
//                     target="_blank"
//                   >
//                     Sign up for emails
//                   </Link>{" "}
//                   to get early access to this lesson!
//                 </>
//               }
//             />
//           </div>
//         ) : null
//       }
//     />
//   );
// };
// export default Lesson;
