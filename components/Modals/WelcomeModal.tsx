import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Image from 'next/image';

interface WelcomeModalProps {
  show: boolean;
  onHide: () => void;
  userFirstName?: string;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({
  show,
  onHide,
  userFirstName,
}) => {
  const handleLetsGoClick = () => {
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="welcome-modal"
    >
      <Modal.Body className="text-center p-4">
        <div className="d-flex justify-content-center mb-3">
          <Image
            src="/GP_bubbleLogo300px.png"
            alt="Galactic Polymath Logo"
            width={120}
            height={120}
            className="img-fluid"
          />
        </div>

        <h2 className="mb-3 fw-bold">
          {userFirstName ? `Welcome, ${userFirstName}` : 'Welcome'}!
        </h2>
        <h4>Your account was created 🚀</h4>
        <section className="w-100 d-flex justify-content-center align-items-center flex-column">
          <p className="mt-2 text-muted lh-lg mb-0">
            If you love what you see, please spread the word!
          </p>
          <p
            style={{ textWrap: 'pretty', maxWidth: '29em' }}
            className="mt-2 text-muted mb-0 text-center lh-lg"
          >
            We're a small team just trying to make science matter to students
            and the broader public.
          </p>
          <p className="text-muted lh-lg mt-2">
            Thanks for being part of this mission! 🙏
          </p>
        </section>
        <Button
          onClick={handleLetsGoClick}
          className="btn btn-primary px-4 py-2"
          style={{
            backgroundColor: '#007BFF',
            borderColor: '#007BFF',
            borderRadius: '6px',
            fontWeight: '500',
          }}
        >
          Let's Go
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default WelcomeModal;
