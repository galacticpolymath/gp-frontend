import React from 'react';

function Dot(props) {

  const getPosition = function (element) {
    var yPosition = 0;

    while (element) {
      yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
      element = element.offsetParent;
    }

    return yPosition
  }

  const classNames = `navDot ${props.section}`

  const doneScrolling = function () {
    window.removeEventListener('scroll', callback)
    document.querySelectorAll('.navDot').forEach(el => el.classList.remove('activeDot'))
    document.querySelector(`.${props.section}`).classList.add('activeDot')
  }

  let done
  const callback = function () {
    // this is the new callback to replace the old one, need to add monitoring functionality here    

    if (typeof done != "undefined") {
      clearTimeout(done)
    }
    done = setTimeout(doneScrolling, 100)

  }

  const scrollWait = function () {
    window.addEventListener('scroll', callback)

  }

  return (
    <div className={classNames} onClick={() => {
      scrollWait()
      document.querySelectorAll('.navDot').forEach(el => el.classList.remove('activeDot'))
      document.querySelector(`.${props.section}`).classList.add('activeDot')

      window.scrollTo({
        top: getPosition(document.getElementById(props.section)) - 110,
        left: 0,
        behavior: 'smooth'
      })
    }}>
      <span>{props.title}</span>
    </div>
  )
}


export default Dot;