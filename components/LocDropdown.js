import React from "react";
import ReactFlagsSelect from "react-flags-select";
import Flag from "react-flags";

const locToCountry= {"en-US": "US", "en-GB": "GB", "en-NZ": "NZ", "fr": "FR", "de": "DE", "it": "IT", "fr-AW": "AW"}
const countryToLoc= {"US": "en-US", "GB": "en-GB", "NZ": "en-NZ", "FR": "fr", "DE": "de", "IT": "it", "AW": "fr-AW"}

const LocDropdown = ({ id, availLocs, loc }) => {

  let countries = []
  let labels = {}
  availLocs.forEach((availLoc) => {
    const country = locToCountry[availLoc];
    countries.push(country);
    labels[country] = availLoc;
  })  

  const changeLoc = (country, id) => {
    const locDest = countryToLoc[country];
    window.location = `/lessons/${locDest}/${id}`
  }

  // const flag = <Flag name={loc} />
  // i can't get the flag to show up in the middle of a string

  return (
    <ReactFlagsSelect selected={loc} countries={countries} customLabels={labels} onSelect={countryCode => {changeLoc(countryCode, id)}} placeholder={"Current locale: " + loc} alignOptionsToRight={true} fullWidth={false} />  
)}

export default LocDropdown;