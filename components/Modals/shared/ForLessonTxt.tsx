interface ForLessonTxtProps {
  lessonNumId?: string | number;
  unitTitle?: string;
}

const ForLessonTxt = ({ lessonNumId, unitTitle }: ForLessonTxtProps) => {
  return (
    <>
      For Lesson {lessonNumId} of <em>{unitTitle}</em>
    </>
  );
};

export default ForLessonTxt;
