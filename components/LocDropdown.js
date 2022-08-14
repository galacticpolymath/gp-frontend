import React from "react";
import ReactFlagsSelect from "react-flags-select";

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

  return (
    <ReactFlagsSelect selected={loc} countries={countries} customLabels={labels} showSelectedLabel={false}
    onSelect={countryCode => {changeLoc(countryCode, id)}} placeholder={loc} alignOptionsToRight={false} fullWidth={false} />  
)}

export default LocDropdown;