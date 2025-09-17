import React from 'react';
import { FormattedMessage } from 'react-intl';
import ImageClassificationTest from '../../components/ImageClassification/ImageClassificationTest';
import css from './ImageClassificationTestPage.css';

/**
 * Test Page for Image Classification
 * 
 * This page provides a dedicated testing environment for the image classification
 * functionality. You can access it at /test-image-classification
 */

const ImageClassificationTestPage = () => {
  return (
    <div className={css.root}>
      <div className={css.container}>
        <header className={css.header}>
          <h1 className={css.title}>
            <FormattedMessage 
              id="ImageClassificationTestPage.title" 
              defaultMessage="Image Classification Test" 
            />
          </h1>
          <p className={css.subtitle}>
            <FormattedMessage 
              id="ImageClassificationTestPage.subtitle" 
              defaultMessage="Test the TensorFlow.js model for automatic tool recognition" 
            />
          </p>
        </header>

        <div className={css.content}>
          <ImageClassificationTest />
        </div>

        <footer className={css.footer}>
          <p className={css.footerText}>
            <FormattedMessage 
              id="ImageClassificationTestPage.footer" 
              defaultMessage="This test page helps verify that your model is working correctly before integrating with the main listing flow." 
            />
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ImageClassificationTestPage;
