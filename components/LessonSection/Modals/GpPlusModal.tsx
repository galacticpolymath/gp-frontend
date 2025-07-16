import React from "react";
import { Modal } from "react-bootstrap";
import Image from "next/image";

interface GpPlusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GpPlusModal: React.FC<GpPlusModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      size="lg"
      centered
      className="gp-plus-modal"
      backdrop="static"
      keyboard={false}
    >
      {/* Header */}
      <div className="gp-plus-modal-header">
        {/* Logo and Close Button */}
        <div className="gp-plus-modal-header-content">
          <div className="gp-plus-modal-logo">
            <Image
              src="/imgs/gp-logos/gp_submark.png"
              alt="GP Plus Logo"
              width={40}
              height={40}
              style={{
                objectFit: "contain",
              }}
            />
          </div>
          <button className="gp-plus-modal-close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      {/* Modal Content */}
      <div className="gp-plus-modal-content">
        <h2 className="gp-plus-modal-title">
          Unlock bulk downloads for 50% off
        </h2>

        <p className="gp-plus-modal-description">
          GP+ now includes bulk lesson downloads. Upgrade by July 17th to get
          50% off your first 3 months.
        </p>

        <a href="#" className="gp-plus-modal-learn-more">
          Learn More
        </a>

        {/* Benefits List */}
        <div className="gp-plus-modal-benefits">
          <div className="gp-plus-modal-benefit">
            <div className="gp-plus-modal-benefit-icon">
              <i className="bi-cloud-arrow-down-fill"></i>
            </div>
            <span>Bulk lesson downloads</span>
          </div>

          <div className="gp-plus-modal-benefit">
            <div className="gp-plus-modal-benefit-icon">
              <i className="bi-unlock-fill"></i>
            </div>
            <span>
              Unlock full app library with engaging classroom activities
            </span>
          </div>

          <div className="gp-plus-modal-benefit">
            <div className="gp-plus-modal-benefit-icon">
              <i className="bi-pencil-fill"></i>
            </div>
            <span>Make lessons your own with full editing access</span>
          </div>
        </div>

        {/* Call to Action Button */}
        <button className="gp-plus-modal-cta">Upgrade for 50% OFF</button>
      </div>

      <style jsx>{`
        .gp-plus-modal {
          border: none;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .gp-plus-modal .modal-content {
          border: none;
          border-radius: 12px;
          overflow: hidden;
        }

        .gp-plus-modal .modal-header {
          display: none;
        }

        .gp-plus-modal .modal-body {
          padding: 0;
        }

        .gp-plus-modal-header {
          position: relative;
          background: linear-gradient(135deg, #e93daa 0%, #f8f9fa 100%);
          padding: 20px;
          border-radius: 12px 12px 0 0;
        }

        .gp-plus-modal-header-content {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .gp-plus-modal-logo {
          display: flex;
          align-items: center;
        }

        .gp-plus-modal-close {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          transition: background-color 0.2s;
          font-size: 18px;
        }

        .gp-plus-modal-close:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }

        .gp-plus-modal-content {
          padding: 30px 25px;
        }

        .gp-plus-modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin: 0 0 15px 0;
          text-align: center;
        }

        .gp-plus-modal-description {
          font-size: 16px;
          color: #666;
          line-height: 1.5;
          margin: 0 0 20px 0;
          text-align: center;
        }

        .gp-plus-modal-learn-more {
          color: #e93daa;
          text-decoration: underline;
          font-weight: 500;
          display: block;
          text-align: center;
          margin-bottom: 25px;
        }

        .gp-plus-modal-benefits {
          margin-bottom: 30px;
        }

        .gp-plus-modal-benefit {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          font-size: 16px;
          color: #333;
        }

        .gp-plus-modal-benefit-icon {
          width: 24px;
          height: 24px;
          background: #e3f2fd;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          color: #1976d2;
          font-size: 12px;
        }

        .gp-plus-modal-cta {
          width: 100%;
          background: #2d69d1;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 16px 24px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .gp-plus-modal-cta:hover {
          background: #1e4a8a;
        }

        @media (max-width: 768px) {
          .gp-plus-modal-content {
            padding: 25px 20px;
          }

          .gp-plus-modal-title {
            font-size: 20px;
          }
        }
      `}</style>
    </Modal>
  );
};

export default GpPlusModal;
