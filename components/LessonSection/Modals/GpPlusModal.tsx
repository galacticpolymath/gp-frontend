/* eslint-disable quotes */

import React from "react";
import { Modal } from "react-bootstrap";
import Image from "next/image";
import Wave from "react-wavify";
import { GrDownload } from "react-icons/gr";
import { FaUnlockKeyhole } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";

interface GpPlusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_COLOR = "#14B1EA";

const GpPlusModal: React.FC<GpPlusModalProps> = ({ isOpen, onClose }) => {
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

      {/* Modal Content */}
      <div className="gp-plus-modal-content">
        <p className="gp-plus-modal-description">
          GP+ now includes bulk lesson downloads. Upgrade by July 17th to get
          50% off your first 3 months.
        </p>

        <a href="#" className="gp-plus-modal-learn-more">
          Learn More
        </a>

        {/* Benefits List */}
        <div className="gp-plus-modal-benefits d-flex flex-column jusitfy-content-center align-items-center">
          <div className="gp-plus-modal-benefit">
            <GrDownload color={ICON_COLOR} />
            <span>Bulk lesson downloads</span>
          </div>

          <div className="gp-plus-modal-benefit">
            <FaUnlockKeyhole color={ICON_COLOR} />
            <span>
              Unlock full app library with engaging classroom activities
            </span>
          </div>

          <div className="gp-plus-modal-benefit">
            <FaEdit color={ICON_COLOR} />
            <span>Make lessons your own with full editing access</span>
          </div>
        </div>

        {/* Call to Action Button */}
        <button className="gp-plus-modal-cta">Upgrade for 50% OFF</button>
      </div>
    </Modal>
  );
};

export default GpPlusModal;
