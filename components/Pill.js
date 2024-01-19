/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable semi */
/* eslint-disable no-console */
/* eslint-disable quotes */
const Pill = ({ 
  txt = "Beta", 
  pillColor = "#6B00BA", 
  zIndex = 0, 
}) =>{
  return (
    <div
      style={{
        border: 'solid 1px white',
        fontStyle: 'italic',
        fontSize: '20px',
        fontWeight: 600,
        transform: 'translate(10px, -15px)',
        backgroundColor: pillColor,
        zIndex: zIndex,
      }}
      className="position-absolute d-flex justify-content-center align-items-center shadow top-0 end-0 text-white text-center px-2 rounded-3"
    >
      {txt}
    </div>
  );
} 

export default Pill;