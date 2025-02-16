
const CheckBoxInput = ({
    txtClassName = '',
    children,
    isChecked,
    name,
    checkBoxInputClassName,
    handleCheckboxOnchange,
    txtStyle = {}
}) => {
    return (
        <section className='d-flex'>
            <input
                type='checkbox'
                name={name}
                value={isChecked}
                onChange={handleCheckboxOnchange}
                checked={isChecked}
                className={checkBoxInputClassName}
            />
            <span style={txtStyle} className={txtClassName}>{children}</span>
        </section>
    )
}

export default CheckBoxInput;