import React from 'react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';
import { FormattedMessage } from '../../util/reactIntl';
import { Modal } from '../';

import css from './ListingTypeSelectionModal.module.css';

/**
 * Modal component for selecting listing type before creating a listing
 */
const ListingTypeSelectionModal = ({ isOpen, onClose, onManageDisableScrolling }) => {
  const history = useHistory();

  // Provide a no-op function if onManageDisableScrolling is not provided
  const handleManageDisableScrolling = onManageDisableScrolling || (() => {});

  const handleSelectRent = () => {
    onClose();
    history.push('/create-listing');
  };

  const handleSelectWishlist = () => {
    onClose();
    history.push('/request-tool');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      id="ListingTypeSelectionModal"
      isOpen={isOpen}
      onClose={onClose}
      onManageDisableScrolling={handleManageDisableScrolling}
      className={css.modal}
      contentClassName={css.modalContent}
      containerClassName={css.modalContainer}
      scrollLayerClassName={css.scrollLayer}
      usePortal
      closeButtonMessage="CLOSE" // Show CLOSE text with X icon
    >
      <div className={css.root}>
        <h2 className={css.title}>
          <FormattedMessage id="ListingTypeSelectionModal.title" />
        </h2>
        <p className={css.description}>
          <FormattedMessage id="ListingTypeSelectionModal.description" />
        </p>
        
        <div className={css.options}>
          <div className={css.optionWrapper}>
            <button
              type="button"
              className={classNames(css.optionButton, css.rentButton)}
              onClick={handleSelectRent}
            >
              <FormattedMessage id="ListingTypeSelectionModal.rentTitle" />
            </button>
            <p className={css.optionDescription}>
              <FormattedMessage id="ListingTypeSelectionModal.rentDescription" />
            </p>
          </div>

          <div className={css.optionWrapper}>
            <button
              type="button"
              className={classNames(css.optionButton, css.wishlistButton)}
              onClick={handleSelectWishlist}
            >
              <FormattedMessage id="ListingTypeSelectionModal.wishlistTitle" />
            </button>
            <p className={css.optionDescription}>
              <FormattedMessage id="ListingTypeSelectionModal.wishlistDescription" />
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ListingTypeSelectionModal;

