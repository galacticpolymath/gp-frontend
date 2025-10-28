import MessageBoxIcon from '../../svgs/MessageBoxIcon';

const LetsTalkBtnContainer = () => {
  const handleBtnClick = _ => {
    window.open('https://portal.galacticpolymath.com/public/form/view/604d904c80fecb0cd51e2529', '_blank');
  };

  return (
    <button onClick={handleBtnClick} className='my-3 btn btn-primary whitespace-nowrap d-flex align-items-center gap-3'>
      Let&apos;s talk!
      <MessageBoxIcon />
    </button>
  );
};

export default LetsTalkBtnContainer;