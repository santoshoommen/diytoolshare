import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import imageClassificationService from '../../services/imageClassification';
import toolDescriptionsClient from '../../services/toolDescriptionsClient';
import css from './ImageClassification.css';

/**
 * Test Component for Image Classification
 * 
 * This component can be used to test the image classification functionality
 * independently of the main listing flow.
 */

const ImageClassificationTest = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError(null);
    }
  };

  const handleClassify = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      await toolDescriptionsClient.ensureLoaded();
      const classificationResult = await imageClassificationService.classifyImage(selectedFile);
      setResult(classificationResult);
    } catch (err) {
      console.error('Classification error:', err);
      setError(err.message || 'Classification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadModel = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const loaded = await imageClassificationService.loadModel();
      if (loaded) {
        setResult({ success: true, message: 'Model loaded successfully' });
      } else {
        setError('Failed to load model');
      }
    } catch (err) {
      console.error('Model loading error:', err);
      setError(err.message || 'Failed to load model');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={css.testContainer}>
      <h3>Image Classification Test</h3>
      
      <div className={css.testSection}>
        <h4>1. Load Model</h4>
        <button 
          onClick={handleLoadModel}
          disabled={isLoading}
          className={css.testButton}
        >
          {isLoading ? 'Loading...' : 'Load Model'}
        </button>
      </div>

      <div className={css.testSection}>
        <h4>2. Select Image</h4>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className={css.fileInput}
        />
        {selectedFile && (
          <p>Selected: {selectedFile.name}</p>
        )}
      </div>

      <div className={css.testSection}>
        <h4>3. Classify Image</h4>
        <button 
          onClick={handleClassify}
          disabled={!selectedFile || isLoading}
          className={css.testButton}
        >
          {isLoading ? 'Classifying...' : 'Classify Image'}
        </button>
      </div>

      {error && (
        <div className={css.errorContainer}>
          <h4>Error:</h4>
          <p className={css.errorText}>{error}</p>
        </div>
      )}

      {result && (
        <div className={css.resultsContainer}>
          <h4>Results:</h4>
          
          {result.success && result.predictions ? (
            <div>
              <h5>Top Prediction:</h5>
              <p>
                <strong>{toolDescriptionsClient.getToolDescriptionSync(result.topPrediction.className)?.title || result.topPrediction.className}</strong>
                <br />
                Confidence: {Math.round(result.topPrediction.confidence * 100)}%
                <br />
                Class: {result.topPrediction.className}
              </p>

              <h5>Tool Description:</h5>
              <p>{toolDescriptionsClient.getToolDescriptionSync(result.topPrediction.className)?.description}</p>

              <h5>All Predictions:</h5>
              <ul>
                {result.predictions.map((prediction, index) => (
                  <li key={index}>
                    {toolDescriptionsClient.getToolDescriptionSync(prediction.className)?.title || prediction.className}: {Math.round(prediction.confidence * 100)}%
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>{result.message || 'Classification completed'}</p>
          )}
        </div>
      )}

      <div className={css.testSection}>
        <h4>Instructions:</h4>
        <ol>
          <li>First, place your model files (model.json, weights.bin) in the /public/models/ directory</li>
          <li>Update the class labels in imageClassification.js to match your model</li>
          <li>Update the tool descriptions in toolDescriptions.js</li>
          <li>Click "Load Model" to initialize the TensorFlow.js model</li>
          <li>Select an image file and click "Classify Image" to test</li>
        </ol>
      </div>
    </div>
  );
};

export default ImageClassificationTest;
