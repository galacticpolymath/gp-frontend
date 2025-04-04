/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable semi */
/* eslint-disable no-console */
/* eslint-disable quotes */
const Pill = ({
  txt = "Beta",
  color = "#6B00BA",
  zIndex = 0,
  xCoordinate = 10,
  yCoordinate = -15,
}) => {
  return (
    <div
      style={{
        border: 'solid 1px white',
        fontStyle: 'italic',
        fontSize: '20px',
        fontWeight: 600,
        transform: `translate(${xCoordinate}px, ${yCoordinate}px)`,
        backgroundColor: color,
        zIndex: zIndex,
      }}
      className="position-absolute d-flex justify-content-center align-items-center shadow top-0 end-0 text-white text-center px-2 rounded-3"
    >
      {txt}
    </div>
  );
}

export default Pill;