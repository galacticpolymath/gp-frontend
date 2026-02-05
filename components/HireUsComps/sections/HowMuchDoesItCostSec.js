 
 
 
 
 
 
 
 
 
 
 
 
 
import tiers from '../../../data/HireUsPg/tiers.json'
import Tier from './Tier';


const HowMuchDoesItCostSec = ({ setTiersInfoForModalArr }) => (
    <section className="howMuchDoesItCostSec pb-5 mb-3 mt-3">
        <div className='ms-0 ms-md-5 ps-0 ps-md-5 pt-5 text-start'>
            <h3 >How much does it cost?</h3>
            <section className="w-100 text-dark fst-italic d-grid justify-content-start ">
                <div >Here are three customizable options to use as a starting point.</div>
            </section>
        </div>
        {/* mobile */}
        <section className="d-flex d-md-none d-xl-flex flex-column flex-xl-row ps-md-5 pe-md-5">
            {tiers.map((tier, index) => {
                return (
                    <Tier
                        isNoBackground={index !== 1}
                        key={index}
                        index={index}
                        tier={tier}
                        setTiersInfoForModalArr={setTiersInfoForModalArr}
                    />
                )
            })}
        </section>
        {/* desktop */}
        <section className="d-none d-md-flex d-xl-none flex-column justify-content-center align-items-center ">
            {tiers.map((tier, index) => {
                return (
                    <Tier
                        isNoBackground={index !== 1}
                        index={index}
                        key={index}
                        tier={tier}
                        setTiersInfoForModalArr={setTiersInfoForModalArr}
                    />
                )
            })}
        </section>
    </section>
)


export default HowMuchDoesItCostSec;