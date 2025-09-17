import * as tf from '@tensorflow/tfjs';

/**
 * Image Classification Service for DIY Tool Recognition
 * 
 * This service loads and runs a Teachable Machine TensorFlow.js model
 * to classify uploaded images and suggest tool descriptions.
 */

class ImageClassificationService {
  constructor() {
    this.model = null;
    this.isLoading = false;
    this.isLoaded = false;
    this.modelPath = '/models/model.json';
    this.confidenceThreshold = 0.7; // Minimum confidence for auto-population
  }

  /**
   * Load the TensorFlow.js model
   * @returns {Promise<boolean>} Success status
   */
  async loadModel() {
    if (this.isLoaded) {
      return true;
    }

    if (this.isLoading) {
      // Wait for existing load to complete
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.isLoaded;
    }

    try {
      this.isLoading = true;
      console.log('Loading TensorFlow.js model...');
      
      this.model = await tf.loadLayersModel(this.modelPath);
      this.isLoaded = true;
      this.isLoading = false;
      
      console.log('Model loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load model:', error);
      this.isLoading = false;
      this.isLoaded = false;
      return false;
    }
  }

  /**
   * Preprocess image for model input
   * @param {HTMLImageElement|HTMLCanvasElement} imageElement 
   * @param {number} targetSize - Target size for model input (default: 224)
   * @returns {tf.Tensor} Preprocessed tensor
   */
  preprocessImage(imageElement, targetSize = 224) {
    return tf.tidy(() => {
      // Convert to tensor and resize
      let tensor = tf.browser.fromPixels(imageElement);
      
      // Resize to target size
      tensor = tf.image.resizeBilinear(tensor, [targetSize, targetSize]);
      
      // Normalize to [0, 1] range
      tensor = tensor.div(255.0);
      
      // Add batch dimension
      tensor = tensor.expandDims(0);
      
      return tensor;
    });
  }

  /**
   * Classify an image and return predictions
   * @param {File|HTMLImageElement|HTMLCanvasElement} imageInput 
   * @returns {Promise<Object>} Classification results
   */
  async classifyImage(imageInput) {
    if (!this.isLoaded) {
      const loaded = await this.loadModel();
      if (!loaded) {
        throw new Error('Failed to load model');
      }
    }

    try {
      let imageElement;
      
      // Handle different input types
      if (imageInput instanceof File) {
        imageElement = await this.fileToImageElement(imageInput);
      } else if (imageInput instanceof HTMLImageElement || imageInput instanceof HTMLCanvasElement) {
        imageElement = imageInput;
      } else {
        throw new Error('Invalid image input type');
      }

      // Preprocess image
      const preprocessedImage = this.preprocessImage(imageElement);
      
      // Run prediction
      const predictions = this.model.predict(preprocessedImage);
      const predictionArray = await predictions.data();
      
      // Clean up tensors
      preprocessedImage.dispose();
      predictions.dispose();
      
      // Get class labels (you'll need to update this based on your model)
      const classLabels = this.getClassLabels();
      
      // Format results
      const results = classLabels.map((label, index) => ({
        className: label,
        confidence: predictionArray[index]
      })).sort((a, b) => b.confidence - a.confidence);

      return {
        success: true,
        predictions: results,
        topPrediction: results[0],
        isConfident: results[0].confidence >= this.confidenceThreshold
      };
      
    } catch (error) {
      console.error('Classification error:', error);
      return {
        success: false,
        error: error.message,
        predictions: [],
        topPrediction: null,
        isConfident: false
      };
    }
  }

  /**
   * Convert File to HTMLImageElement
   * @param {File} file 
   * @returns {Promise<HTMLImageElement>}
   */
  fileToImageElement(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Get class labels for the model
   * This should match the classes your Teachable Machine model was trained on
   * @returns {Array<string>} Array of class names
   */
  getClassLabels() {
    // These labels match your Teachable Machine model's training classes
    // Order is important - must match the model's output layer
    return [
      'Circular saw',
      'Cordless drill', 
      'Hammer',
      'Ladder',
      'Lawnmower',
      'Spanner - Wrench'
    ];
  }

  /**
   * Get tool description based on classification
   * @param {string} className 
   * @param {number} confidence 
   * @returns {Object} Tool description and metadata
   */
  getToolDescription(className, confidence) {
    const toolDescriptions = {
      drill: {
        title: 'Power Drill',
        description: 'Versatile power tool for drilling holes and driving screws. Perfect for woodworking, construction, and DIY projects.',
        category: 'Power Tools',
        features: ['Variable speed control', 'Rechargeable battery', 'Multiple drill bits included'],
        safetyNotes: ['Always wear safety glasses', 'Ensure secure workpiece clamping', 'Check battery charge before use']
      },
      hammer: {
        title: 'Hammer',
        description: 'Essential hand tool for driving nails, breaking objects, and general construction work.',
        category: 'Hand Tools',
        features: ['Ergonomic grip', 'Claw for nail removal', 'Durable steel head'],
        safetyNotes: ['Use appropriate hammer weight for task', 'Check handle for cracks', 'Wear safety glasses when striking']
      },
      saw: {
        title: 'Hand Saw',
        description: 'Traditional cutting tool for wood, perfect for precise cuts and general carpentry work.',
        category: 'Hand Tools',
        features: ['Sharp teeth for clean cuts', 'Comfortable handle', 'Various blade lengths available'],
        safetyNotes: ['Keep blade sharp and clean', 'Use proper cutting technique', 'Secure workpiece before cutting']
      },
      wrench: {
        title: 'Adjustable Wrench',
        description: 'Versatile tool for tightening and loosening nuts and bolts of various sizes.',
        category: 'Hand Tools',
        features: ['Adjustable jaw width', 'Strong steel construction', 'Non-slip grip'],
        safetyNotes: ['Ensure proper fit on fastener', 'Pull towards you when possible', 'Don\'t use as a hammer']
      },
      screwdriver: {
        title: 'Screwdriver Set',
        description: 'Essential tool for driving and removing screws. Available in various sizes and types.',
        category: 'Hand Tools',
        features: ['Multiple tip sizes', 'Magnetic tips', 'Comfortable grip'],
        safetyNotes: ['Use correct tip size for screw', 'Keep tips clean and sharp', 'Don\'t use as pry bar']
      },
      pliers: {
        title: 'Pliers',
        description: 'Multi-purpose gripping and cutting tool for electrical work, plumbing, and general repairs.',
        category: 'Hand Tools',
        features: ['Serrated jaws for grip', 'Wire cutting capability', 'Insulated handles'],
        safetyNotes: ['Use appropriate size for task', 'Check insulation on handles', 'Don\'t use on live electrical circuits']
      },
      level: {
        title: 'Spirit Level',
        description: 'Precision tool for ensuring surfaces are perfectly horizontal or vertical.',
        category: 'Measuring Tools',
        features: ['Multiple bubble vials', 'Durable aluminum construction', 'Magnetic base'],
        safetyNotes: ['Handle with care to avoid damage', 'Clean vials regularly', 'Store in protective case']
      },
      tape_measure: {
        title: 'Tape Measure',
        description: 'Essential measuring tool for accurate length measurements in construction and DIY projects.',
        category: 'Measuring Tools',
        features: ['Locking mechanism', 'Clear markings', 'Durable case'],
        safetyNotes: ['Retract slowly to avoid injury', 'Keep clean and dry', 'Check accuracy periodically']
      },
      other: {
        title: 'Tool',
        description: 'General purpose tool for various DIY and construction tasks.',
        category: 'General Tools',
        features: ['Versatile use', 'Durable construction'],
        safetyNotes: ['Read manufacturer instructions', 'Use appropriate safety equipment', 'Store safely when not in use']
      }
    };

    return toolDescriptions[className] || toolDescriptions.other;
  }

  /**
   * Dispose of the model to free memory
   */
  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isLoaded = false;
    }
  }
}

// Create singleton instance
const imageClassificationService = new ImageClassificationService();

export default imageClassificationService;
