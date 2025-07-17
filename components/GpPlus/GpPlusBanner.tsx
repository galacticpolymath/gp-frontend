/* eslint-disable quotes */

import React, { useState } from "react";
import { TUnitForUI } from "../../backend/models/Unit/types/unit";
import Image from "next/image";
import { Button } from "react-bootstrap";
import GpPlusModal from "../LessonSection/Modals/GpPlusModal";

interface IProps {
  className?: string;
}

const GpPlusBanner: React.FC<IProps> = ({
  className = "cover-parent-container rounded row py-2 flex-wrap",
}) => {
  const [isGpPlusModalDisplayed, setIsGpPlusModalDisplayed] = useState(false);

  return (
    <>
      <div
        style={{ backgroundColor: "#EDE3FA", border: "solid 2px #2C37C2" }}
        className={className}
      >
        <section className="col-4 col-sm-2">
          <div className="d-flex justify-content-center align-items-sm-center w-100 h-100">
            <Image
              alt="gp_plus_logo"
              width={125}
              height={125}
              src="/imgs/gp-logos/gp_submark.png"
              style={{
                objectFit: "contain",
                width: "125px",
                height: "125px",
                minWidth: "100px",
                minHeight: "100px",
              }}
            />
          </div>
        </section>
        <section className="col-8 col-sm-10 col-xl-7">
          <div className="w-100 h-100 d-flex justify-content-center align-items-center flex-column">
            <h3 className="w-100">Download & Edit lessons in one-click</h3>
            <div className="w-100">Get 50% off GP+</div>
          </div>
        </section>
        <section className="col-12 col-xl-3 py-3 px-1">
          <Button
            onClick={() => {
              setIsGpPlusModalDisplayed(true);
            }}
            style={{
              backgroundColor: "#1C28BD",
              borderRadius: "2em",
              maxWidth: "360px",
              height: "95px",
              zIndex: 1,
            }}
            className="w-100 py-0"
          >
            <div className="row">
              <section className="col-4 d-none d-sm-block">
                <div className="w-100 h-100 p-0 m-0 position-relative">
                  <Image
                    alt="gp_plus_logo"
                    width={150}
                    height={150}
                    src="/imgs/gp-logos/gp_submark.png"
                    className="center-absolutely"
                    style={{
                      objectFit: "contain",
                      width: "150px",
                      height: "150px",
                      minHeight: "125px",
                      minWidth: "125px",
                      maxWidth: "150px",
                      maxHeight: "150px",
                      zIndex: 1,
                    }}
                  />
                </div>
              </section>
              <section style={{ zIndex: 10 }} className="col-12 col-sm-8">
                <section className="w-100">
                  <h6
                    style={{ textTransform: "none" }}
                    className="w-100 p-0 text-center text-sm-start text-normal text-wrap"
                  >
                    Upgrade to GP+ Plus
                  </h6>
                </section>
                <section
                  style={{ textTransform: "none" }}
                  className="w-100 text-center text-sm-start text-normal"
                >
                  Get 50% off
                </section>
              </section>
            </div>
          </Button>
        </section>
      </div>
      <GpPlusModal
        isOpen={isGpPlusModalDisplayed}
        onClose={() => setIsGpPlusModalDisplayed(false)}
      />
    </>
  );
};

export default GpPlusBanner;
