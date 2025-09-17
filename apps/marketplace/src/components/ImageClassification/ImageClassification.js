import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { IconSpinner, IconCheck, IconAlert } from '../../components';
import imageClassificationService from '../../services/imageClassification';
import { getToolDescription } from '../../data/toolDescriptions';
import css from './ImageClassification.css';

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
    className,
    rootClassName,
    disabled = false
  } = props;

  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState(null);
  const [suggestionAccepted, setSuggestionAccepted] = useState(false);
  const [error, setError] = useState(null);

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
        
        // Get tool description for the top prediction
        const toolDescription = getToolDescription(result.topPrediction.className);
        
        // Call the completion callback with full results
        if (onClassificationComplete) {
          onClassificationComplete({
            ...result,
            toolDescription,
            suggestion: {
              title: toolDescription.title,
              description: toolDescription.description,
              category: toolDescription.category,
              features: toolDescription.features,
              safetyNotes: toolDescription.safetyNotes
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
      const toolDescription = getToolDescription(classificationResult.topPrediction.className);
      onSuggestionAccepted({
        title: toolDescription.title,
        description: toolDescription.description,
        category: toolDescription.category,
        features: toolDescription.features,
        safetyNotes: toolDescription.safetyNotes
      });
    }
    setSuggestionAccepted(true);
  };

  const handleRejectSuggestion = () => {
    if (onSuggestionRejected) {
      onSuggestionRejected(classificationResult);
    }
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
          <div className={css.classificationHeader}>
            <IconCheck className={css.successIcon} />
            <h4 className={css.classificationTitle}>
              <FormattedMessage 
                id="ImageClassification.classificationComplete" 
                defaultMessage="Image Analysis Complete" 
              />
            </h4>
          </div>

          <div className={css.predictionContainer}>
            <div className={css.predictionInfo}>
              <span className={css.predictedTool}>
                {getToolDescription(topPrediction.className).title}
              </span>
              <span className={classNames(css.confidence, {
                [css.highConfidence]: isConfident,
                [css.lowConfidence]: !isConfident
              })}>
                {Math.round(topPrediction.confidence * 100)}% confidence
              </span>
            </div>

            {!isConfident && (
              <div className={css.lowConfidenceWarning}>
                <IconAlert className={css.warningIcon} />
                <span>
                  <FormattedMessage 
                    id="ImageClassification.lowConfidence" 
                    defaultMessage="Low confidence - please verify the suggestion" 
                  />
                </span>
              </div>
            )}
          </div>

          {!suggestionAccepted && (
            <div className={css.suggestionContainer}>
              <h5 className={css.suggestionTitle}>
                <FormattedMessage 
                  id="ImageClassification.suggestion" 
                  defaultMessage="Suggested Description:" 
                />
              </h5>
              <p className={css.suggestionDescription}>
                {getToolDescription(topPrediction.className).description}
              </p>
              
              <div className={css.actionButtons}>
                <button
                  type="button"
                  className={css.acceptButton}
                  onClick={handleAcceptSuggestion}
                  disabled={disabled}
                >
                  <FormattedMessage 
                    id="ImageClassification.acceptSuggestion" 
                    defaultMessage="Use This Description" 
                  />
                </button>
                <button
                  type="button"
                  className={css.rejectButton}
                  onClick={handleRejectSuggestion}
                  disabled={disabled}
                >
                  <FormattedMessage 
                    id="ImageClassification.rejectSuggestion" 
                    defaultMessage="Write My Own" 
                  />
                </button>
              </div>
            </div>
          )}

          {suggestionAccepted && (
            <div className={css.acceptedContainer}>
              <IconCheck className={css.acceptedIcon} />
              <span className={css.acceptedText}>
                <FormattedMessage 
                  id="ImageClassification.suggestionAccepted" 
                  defaultMessage="Description applied successfully!" 
                />
              </span>
            </div>
          )}

          {/* Show additional predictions if confidence is low */}
          {!isConfident && classificationResult.predictions.length > 1 && (
            <div className={css.alternativePredictions}>
              <h6 className={css.alternativesTitle}>
                <FormattedMessage 
                  id="ImageClassification.alternatives" 
                  defaultMessage="Other possibilities:" 
                />
              </h6>
              <ul className={css.alternativesList}>
                {classificationResult.predictions.slice(1, 4).map((prediction, index) => (
                  <li key={index} className={css.alternativeItem}>
                    <span className={css.alternativeName}>
                      {getToolDescription(prediction.className).title}
                    </span>
                    <span className={css.alternativeConfidence}>
                      {Math.round(prediction.confidence * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageClassification;
