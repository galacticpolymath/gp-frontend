import Dot from './Dot';
import React, { useEffect, useState } from 'react';

import './index.scss'

const readHeadings = () => {
  const titleArray = []
  let headings = document.querySelectorAll('.SectionHeading')
  headings.forEach((el) => {

    const indextitle = el.firstChild.textContent
    const index = +indextitle.substr(0, indextitle.indexOf(' ')).slice(0, -1)
    const title = indextitle.substr(indextitle.indexOf(' ') + 1)

    titleArray.push([index, title, el.id])
  })
  return titleArray
}

function NavigationDots({
  sections
}) {
  const [titles, setTitles] = useState([])

  // big assumption, all section headings start off with a number
  // have to do this because sectionheading structure is at uneven nesting levels so querySelectorAll brings them up out of order
  // also assuming the title content appears from the node's first child's content. appears to be consistent so far.

  useEffect(() => {
    setTitles(readHeadings())
  }, [sections])

  let dots = titles.map((title) => {
    return (<Dot key={`${title[0]}_${title[2]}`} section={title[2]} title={title[1]} />)
  })

  return (
    <div className="scroll-indicator-controller">
      {dots}
    </div>
  )
}

export default NavigationDots