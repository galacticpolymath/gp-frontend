/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
import { useContext, useState } from "react";
import Button from "../../../General/Button";
import { UserContext } from "../../../../providers/UserProvider";
import countryNames from "../../../../data/User/countryNames.json";

const CountrySection = ({ _errors, setIsInputFocused }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [isCountriesInputFocused, setIsCountriesInputFocused] = useState(false);
    const { _aboutUserForm } = useContext(UserContext);
    /**
     * @type {[Map<string, string>, Function]}
     */
    const [errors, setErrors] = _errors;
    /** @type {[import("../../../../providers/UserProvider").TAboutUserForm, Function]} */
    const [aboutUserForm, setAboutUserForm] = _aboutUserForm;

    const handleOnInputFocus = () => {
        setIsCountriesInputFocused(true);
        setIsInputFocused(true);
    };

    const handleCountrySelectionBtnClick = ({ target }) => {
        setErrors(state => {
            /**
             * @type {Map<string, string}
             */
            const stateClone = structuredClone(state);

            stateClone.delete('country');

            return stateClone;
        });
        let aboutUserFormUpdated = { ...aboutUserForm };

        if (target.value.toLowerCase() !== 'united states') {
            aboutUserFormUpdated = {
                ...aboutUserFormUpdated,
                zipCode: '',
            };
            setErrors(state => {
                /**
                 * @type {Map<string, string}
                 */
                const stateClone = structuredClone(state);

                stateClone.delete('zipCode');

                return stateClone;
            });
        }

        setAboutUserForm({
            ...aboutUserFormUpdated,
            country: target.value,
        });
        setIsCountriesInputFocused(false);
    };

    const handleInputOnChange = ({ target }) => {
        setAboutUserForm(state => ({ ...state, country: target.value }));

        if (!target.value.length) {
            setSearchResults([]);
            return;
        }

        const searchedCountries = countryNames.filter(countryName => countryName.toLowerCase().includes(target.value.toLowerCase()));

        setSearchResults(searchedCountries);
    };

    return (
        <section className='d-flex flex-column my-4 my-lg-0 col-12 col-sm-8 col-lg-4'>
            <label htmlFor='country-input' className={errors?.has('country') ? 'text-danger' : ''}>
                *Country:
            </label>
            <div className='position-relative ms-2 ms-sm-0 d-flex flex-column'>
                <input
                    placeholder='Your country'
                    style={{ maxWidth: '400px' }}
                    className={`aboutme-txt-input no-outline w-100 pt-1 ${errors?.has('country') ? 'border-danger text-danger' : ''}`}
                    defaultValue={aboutUserForm.country}
                    value={aboutUserForm.country}
                    onChange={handleInputOnChange}
                    onFocus={handleOnInputFocus}
                    onBlur={() => {
                        setIsInputFocused(false);
                    }}
                />
                <span style={{ height: '25px', fontSize: '16px' }} className='text-danger'>{errors?.get('country') ?? ''}</span>
                {isCountriesInputFocused && (
                    <div
                        id='searchResultsModal'
                        style={{ zIndex: 100, maxWidth: '400px', maxHeight: '400px', width: '100%', transform: 'translateY(35px)' }}
                        className="position-absolute border bg-white rounded shadow overflow-scroll"
                    >
                        <section className='d-flex flex-column p-2'>
                            <h6>Common Selections: </h6>
                            <Button
                                value="United States"
                                handleOnClick={handleCountrySelectionBtnClick}
                                classNameStr="border-bottom no-btn-styles py-2 d-flex ps-2 border-bottom"
                            >
                                United States
                            </Button>
                            <Button
                                value="New Zealand"
                                handleOnClick={handleCountrySelectionBtnClick}
                                classNameStr="no-btn-styles py-2 d-flex ps-2"
                            >
                                New Zealand
                            </Button>
                        </section>
                        <section style={{ borderTop: 'solid 1.3px gray' }} className="d-flex flex-column p-2">
                            <h6>
                                Search Result(s):
                            </h6>
                            {searchResults?.length ? searchResults.map(country => {
                                return (
                                    <Button
                                        defaultStyleObj={{ width: '80%' }}
                                        key={country}
                                        value={country}
                                        handleOnClick={handleCountrySelectionBtnClick}
                                        classNameStr="ps-2 border-bottom no-btn-styles py-2 d-flex text-wrap"
                                    >
                                        {country}
                                    </Button>
                                );
                            })
                                :
                                <span className="ps-2" style={{ fontStyle: "italic" }}>Type your country.</span>
                            }
                        </section>
                    </div>
                )
                }
            </div>
        </section>
    );
};

export default CountrySection;