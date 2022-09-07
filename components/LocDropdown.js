import React from "react";
import ReactFlagsSelect from "react-flags-select";

const getLanguage = new Intl.DisplayNames(['en'], {type: 'language'})
const countryToLoc= {"US": "en-US", "GB": "en-GB", "NZ": "en-NZ", "FR": "fr", "DE": "de", "IT": "it", "AW": "fr-AW"}

const LocDropdown = ({ id, availLocs, loc }) => {

  let countries = []
  let labels = {}
  availLocs.forEach((availLoc) => {
    const country = new Intl.Locale(availLoc).region;
    countries.push(country);
    labels[country] = { primary: availLoc, secondary: getLanguage.of(availLoc) };
  })  

  let country = new Intl.Locale(loc).region;

  const changeLoc = (country, id) => {
    const locDest = countryToLoc[country];
    window.location = `/lessons/${locDest}/${id}`
  }

  // const flag = <Flag name={loc} />
  // i can't get the flag to show up in the middle of a string

  return (
    <ReactFlagsSelect selected={country} countries={countries} customLabels={labels} onSelect={countryCode => {changeLoc(countryCode, id)}} placeholder={"Current locale: " + loc} alignOptionsToRight={true} fullWidth={false} showSelectedLabel={true} showSecondarySelectedLabel={false} showOptionLabel={false} showSecondaryOptionLabel={true} />  
)}

export default LocDropdown;