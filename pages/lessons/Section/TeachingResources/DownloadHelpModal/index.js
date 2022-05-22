import React, { useState } from 'react';

import SignedIn from './signedIn.png';
import NotSignedIn from './notSignedIn.png';

const Transition = React.forwardRef(function Transition(props, ref) {
  return null;
  // return <Slide direction="down" ref={ref} {...props} />;
});

Transition.displayName = 'Transition';

const DownloadHelpModal = ({ id }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className='DownloadHelpModal'>
      <span onClick={() => setShowModal(true)}>
        {/* <HelpOutlineIcon /> */}
      </span>
      {/* {showModal &&
        <Dialog
          classes={{
            root: classes.modalRoot,
            paper: classes.modalLarge,
          }}
          className='DownloadHelpModalDialog'
          open={showModal}
          TransitionComponent={Transition}
          keepMounted
          onClose={() => setShowModal(false)}
          aria-labelledby={`${id}-title`}
          aria-describedby="classic-modal-slide-description"
        >
          <DialogTitle
            id={`${id}-title`}
            disableTypography
            className={classes.modalHeader}
          >
            <Button
              simple
              className={classes.modalCloseButton}
              key="close"
              aria-label="Close"
              onClick={() => setShowModal(false)}
            >
              {' '}
              <Close className={classes.modalClose} />
            </Button>
            <h4 className={classes.modalTitle}>
              Download From Google Drive
            </h4>
          </DialogTitle>
          <DialogContent
            id={`${id}-description`}
            className={classes.modalBody}
          >
            <div className="flex">
              <div>
                <p>
                  If logged into Google, click the dropdown menu on the folder containing handouts & presentations, and select download:
                </p>
                <img
                  alt="A screenshot of a dropdown in Google Drive with the menu item 'Download' circled."
                  src={SignedIn}
                  style={{ maxWidth: '15rem' }}
                />
              </div>
              <div>

                <p>
                  If <em>not</em> logged into Google, click this icon in the upper right:
                </p>
                <img
                  alt="A screenshot of Google Drive with a button called 'Download 'All' circled."
                  src={NotSignedIn}
                  style={{ maxWidth: '13rem' }}
                />
              </div>

            </div>
          </DialogContent>
          <DialogActions className={classes.modalFooter}>
            <Button
              onClick={() => setShowModal(false)}
            >
              Okay!
            </Button>
          </DialogActions>
        </Dialog>} */}
    </div>
  );
};

export default DownloadHelpModal;