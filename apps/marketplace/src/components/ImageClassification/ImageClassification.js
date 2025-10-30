import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { IconSpinner, IconCheckmark, IconAlert } from '../../components';
import imageClassificationService from '../../services/imageClassification';
import toolDescriptionsClient from '../../services/toolDescriptionsClient';
import css from './ImageClassification.css';
import categoriesClient from '../../services/categoriesClient';

/**
 * Image Classification Component
 * 
 * This component handles the classification of uploaded images and provides
 * auto-population suggestions for tool descriptions.
 */

const ImageClassification = props => {
  const {
    imageFile,
    onClassificationComplete,
    onSuggestionAccepted,
    onSuggestionRejected,
    onWriteOwn,
    onRetryUpload,
    className,
    rootClassName,
    disabled = false
  } = props;

  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState(null);
  const [suggestionAccepted, setSuggestionAccepted] = useState(false);
  const [toolDescription, setToolDescription] = useState(null);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Classify image when imageFile changes
  useEffect(() => {
    if (imageFile && !disabled) {
      classifyImage(imageFile);
    }
  }, [imageFile, disabled]);

  const classifyImage = async (file) => {
    if (!file) return;

    setIsClassifying(true);
    setError(null);
    setClassificationResult(null);
    setSuggestionAccepted(false);

    try {
      const result = await imageClassificationService.classifyImage(file);
      
      if (result.success) {
        setClassificationResult(result);
        // Ensure CMS data is loaded and get description
        await toolDescriptionsClient.ensureLoaded();
        const desc = toolDescriptionsClient.getToolDescriptionSync(result.topPrediction.className);
        setToolDescription(desc);
        
        // Call the completion callback with full results
        if (onClassificationComplete) {
          onClassificationComplete({
            ...result,
            toolDescription: desc,
            suggestion: {
              title: desc?.title,
              description: desc?.description,
              category: desc?.category,
              features: desc?.features,
              safetyNotes: desc?.safetyNotes,
              price: desc?.price,
            }
          });
        }
      } else {
        setError(result.error || 'Classification failed');
      }
    } catch (err) {
      console.error('Image classification error:', err);
      setError('Failed to classify image. Please try again.');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (classificationResult && onSuggestionAccepted) {
      onSuggestionAccepted({
        title: toolDescription?.title,
        description: toolDescription?.description,
        category: toolDescription?.category,
        features: toolDescription?.features,
        safetyNotes: toolDescription?.safetyNotes,
        price: toolDescription?.price,
      });
    }
    setSuggestionAccepted(true);
  };

  const handleRejectSuggestion = () => {
    if (onSuggestionRejected) {
      onSuggestionRejected(classificationResult);
    }
    if (onWriteOwn) onWriteOwn();
    setSuggestionAccepted(false);
  };

  const handleRetry = () => {
    if (imageFile) {
      classifyImage(imageFile);
    }
  };

  const rootClasses = classNames(rootClassName || css.root, className);
  const isConfident = classificationResult?.isConfident;
  const topPrediction = classificationResult?.topPrediction;

  // Build preview URL for the selected file
  useEffect(() => {
    if (imageFile instanceof File) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    return undefined;
  }, [imageFile]);

  return (
    <div className={rootClasses}>
      {isClassifying && (
        <div className={css.classifyingContainer}>
          <IconSpinner className={css.spinner} />
          <p className={css.classifyingText}>
            <FormattedMessage id="ImageClassification.classifying" defaultMessage="Analyzing image..." />
          </p>
        </div>
      )}

      {error && (
        <div className={css.errorContainer}>
          <IconAlert className={css.errorIcon} />
          <p className={css.errorText}>{error}</p>
          <button 
            type="button" 
            className={css.retryButton}
            onClick={handleRetry}
            disabled={disabled}
          >
            <FormattedMessage id="ImageClassification.retry" defaultMessage="Try Again" />
          </button>
        </div>
      )}

      {classificationResult && !error && (
        <div className={css.resultsContainer}>
          {(!isConfident || !toolDescription?.title) ? (
            <>
              <h4 className={css.sectionTitle}>We couldn’t auto‑identify this tool</h4>
              {previewUrl ? (
                <div className={css.previewWrapper}>
                  <img src={previewUrl} alt="Selected" className={css.previewImage} />
                </div>
              ) : null}
              <p className={css.confirmText}>Couldn’t auto-identify this tool. Try a clearer photo or add details manually.</p>
              <div className={`${css.actionButtonsConfirm || ''} actionButtonsConfirm`}>
                <button
                  type="button"
                  className={`${css.acceptButton || ''} acceptButton`}
                  onClick={() => onRetryUpload && onRetryUpload()}
                  disabled={disabled}
                >
                  Try again
                </button>
                <button
                  type="button"
                  className={`${css.rejectButton || ''} rejectButton`}
                  onClick={handleRejectSuggestion}
                  disabled={disabled}
                >
                  Add manually
                </button>
              </div>
            </>
          ) : (
            <>
              <h4 className={css.sectionTitle}>Confirm Tool Details</h4>
              {previewUrl ? (
                <div className={css.previewWrapper}>
                  <img src={previewUrl} alt="Selected" className={css.previewImage} />
                </div>
              ) : null}
              <p className={css.confirmText}>
                Are you trying to upload a listing for{' '}
                <strong>{toolDescription?.title || topPrediction.className}</strong>{' '}under{' '}
                <strong>{toolDescription?.categoryLabel || categoriesClient.getLabel(toolDescription?.category) || 'Tools'}</strong>
                ?
              </p>
              <div className={`${css.actionButtonsConfirm || ''} actionButtonsConfirm`}>
                <button
                  type="button"
                  className={`${css.acceptButton || ''} acceptButton`}
                  onClick={handleAcceptSuggestion}
                  disabled={disabled}
                >
                  Yes, that's correct
                </button>
                <button
                  type="button"
                  className={`${css.rejectButton || ''} rejectButton`}
                  onClick={handleRejectSuggestion}
                  disabled={disabled}
                >
                  Write My Own
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageClassification;
