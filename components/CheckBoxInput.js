const CheckBoxInput = ({
  txtClassName = '',
  children,
  isChecked,
  name,
  checkBoxInputClassName,
  handleCheckboxOnchange,
  txtStyle = {},
  handleOnTxtClick = () => { },
}) => {
  return (
    <section className="d-flex">
      <input
        type="checkbox"
        name={name}
        value={isChecked}
        onChange={handleCheckboxOnchange}
        checked={isChecked}
        className={`${checkBoxInputClassName} pointer`}
      />
      <span
        onClick={handleOnTxtClick}
        style={txtStyle}
        className={txtClassName}
      >
        {children}
      </span>
    </section>
  );
};

export default CheckBoxInput;
