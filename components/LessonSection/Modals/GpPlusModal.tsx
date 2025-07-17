/* eslint-disable quotes */

import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Image from "next/image";
import Wave from "react-wavify";
import { GrDownload } from "react-icons/gr";
import { FaUnlockKeyhole } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import Link from "next/link";

interface GpPlusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_COLOR = "#14B1EA";

const GpPlusModal: React.FC<GpPlusModalProps> = ({ isOpen, onClose }) => {
  const [wasGpPlusBtnClicked, setWasGpPlusBtnClicked] = useState(false);

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      size="lg"
      centered
      className="rounded"
      keyboard={false}
    >
      <div>
        <div
          style={{ borderTopLeftRadius: "1em", borderTopRightRadius: "1em" }}
          className="gp-plus-modal-gradient position-relative"
        >
          <div
            style={{
              zIndex: 1000,
              left: "50%",
              transform: "translate(-50%, 0%)",
            }}
            className="position-absolute d-flex flex-column justify-content-center align-items-center"
          >
            <Image
              src="/imgs/gp-logos/gp_submark.png"
              alt="GP Plus Logo"
              width={110}
              height={110}
              style={{
                objectFit: "contain",
              }}
            />
            <h2 className="gp-plus-modal-title">
              Unlock bulk downloads for 50% off
            </h2>
          </div>
          <Wave
            fill="white"
            paused
            style={{
              display: "flex",
              borderBottom: "solid 1px white",
            }}
            options={{
              height: 60,
              amplitude: 450,
              speed: 0.15,
              points: 2,
            }}
          />
        </div>
      </div>
      <div className="gp-plus-modal-content">
        <p className="gp-plus-modal-description mt-4 mt-sm-0">
          GP+ now includes bulk lesson downloads. Upgrade by August 15th to get
          50% off your first 3 months.
        </p>
        <Link href="/gp-plus" className="gp-plus-modal-learn-more">
          Learn More
        </Link>
        <ul className="d-flex flex-column jusitfy-content-center align-items-center list-unstyled">
          <li className="gp-plus-modal-benefit w-100 d-flex justify-content-center align-items-center">
            <div className="w-75 justify-content-center align-items-center d-flex">
              <section className="d-flex justify-content-center align-items-center">
                <GrDownload color={ICON_COLOR} />
              </section>
              <section
                style={{ paddingTop: ".2em" }}
                className="ps-1 d-flex justify-content-center align-items-center"
              >
                <span className="text-center">Bulk lesson downloads</span>
              </section>
            </div>
          </li>
          <li className="gp-plus-modal-benefit w-100 d-flex justify-content-center align-items-center">
            <div className="w-75 justify-content-center align-items-center d-flex">
              <section className="d-flex justify-content-center align-items-center">
                <FaUnlockKeyhole color={ICON_COLOR} />
              </section>
              <section
                style={{ paddingTop: ".2em" }}
                className="ps-1 d-flex justify-content-center align-items-center"
              >
                <span>
                  Unlock full app library with engaging classroom activities
                </span>
              </section>
            </div>
          </li>
          <li className="gp-plus-modal-benefit w-100 d-flex justify-content-center align-items-center">
            <div className="w-75 justify-content-center align-items-center d-flex">
              <section className="d-flex justify-content-center align-items-center">
                <FaEdit color={ICON_COLOR} />
              </section>
              <section
                style={{ paddingTop: ".2em" }}
                className="d-flex justify-content-center align-items-center ps-1"
              >
                <span>Make lessons your own with full editing access.</span>
              </section>
            </div>
          </li>
        </ul>
        <section className="d-block d-sm-flex justify-content-sm-center align-items-sm-center w-100">
          <Link
            href={`${typeof window === "undefined" ? "" : window.location.origin}/gp-plus`}
            className="no-link-decoration text-decoration-underline gp-plus-modal-cta px-1 py-2"
          >
            <Button style={{ borderRadius: "1em", backgroundColor: "#1c28bd" }} className="w-100">
              Upgrade for 50% OFF
            </Button>
          </Link>
        </section>
      </div>
    </Modal>
  );
};

export default GpPlusModal;
