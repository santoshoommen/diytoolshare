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
    // Use absolute URL for production environments
    this.modelPath = this.getModelPath();
    this.confidenceThreshold = 0.7; // Minimum confidence for auto-population
  }

  /**
   * Get the correct model path based on environment
   * @returns {string} Model path
   */
  getModelPath() {
    // In production, use absolute URL to ensure proper loading
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      return `${baseUrl}/models/model.json`;
    }
    // Fallback for server-side rendering
    return '/models/model.json';
  }

  /**
   * Try multiple model paths if the primary one fails
   * @returns {Promise<string>} Working model path
   */
  async findWorkingModelPath() {
    const possiblePaths = [
      this.modelPath,
      '/models/model.json',
      './models/model.json',
      `${window.location.origin}/models/model.json`
    ];

    for (const path of possiblePaths) {
      try {
        console.log(`Trying model path: ${path}`);
        const response = await fetch(path);
        if (response.ok) {
          console.log(`Found working model path: ${path}`);
          return path;
        }
      } catch (error) {
        console.log(`Path ${path} failed:`, error.message);
      }
    }
    
    throw new Error('No working model path found');
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
      console.log('Model path:', this.modelPath);
      console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');
      
      // Test if the model file is accessible, try fallback paths if needed
      let workingPath = this.modelPath;
      try {
        const response = await fetch(this.modelPath);
        if (!response.ok) {
          console.log('Primary model path failed, trying fallback paths...');
          workingPath = await this.findWorkingModelPath();
        } else {
          console.log('Model file is accessible');
        }
      } catch (fetchError) {
        console.log('Primary model path failed, trying fallback paths...');
        try {
          workingPath = await this.findWorkingModelPath();
        } catch (fallbackError) {
          console.error('All model paths failed:', fallbackError);
          throw new Error(`Model file not accessible. Tried: ${this.modelPath} and fallback paths`);
        }
      }
      
      console.log(`Loading model from: ${workingPath}`);
      this.model = await tf.loadLayersModel(workingPath);
      this.isLoaded = true;
      this.isLoading = false;
      
      console.log('Model loaded successfully');
      console.log('Model input shape:', this.model.inputs[0].shape);
      return true;
    } catch (error) {
      console.error('Failed to load model:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        modelPath: this.modelPath,
        currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A'
      });
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
    console.log('Starting image classification...');
    
    if (!this.isLoaded) {
      console.log('Model not loaded, attempting to load...');
      const loaded = await this.loadModel();
      if (!loaded) {
        console.error('Failed to load model for classification');
        throw new Error('Failed to load model');
      }
    }

    try {
      let imageElement;
      
      // Handle different input types
      if (imageInput instanceof File) {
        console.log('Processing file input...');
        imageElement = await this.fileToImageElement(imageInput);
      } else if (imageInput instanceof HTMLImageElement || imageInput instanceof HTMLCanvasElement) {
        console.log('Processing image element input...');
        imageElement = imageInput;
      } else {
        throw new Error('Invalid image input type');
      }

      console.log('Preprocessing image...');
      // Preprocess image
      const preprocessedImage = this.preprocessImage(imageElement);
      
      console.log('Running model prediction...');
      // Run prediction
      const predictions = this.model.predict(preprocessedImage);
      const predictionArray = await predictions.data();
      
      console.log('Raw predictions:', predictionArray);
      
      // Clean up tensors
      preprocessedImage.dispose();
      predictions.dispose();
      
      // Get class labels (you'll need to update this based on your model)
      const classLabels = this.getClassLabels();
      console.log('Class labels:', classLabels);
      
      // Format results
      const results = classLabels.map((label, index) => ({
        className: label,
        confidence: predictionArray[index]
      })).sort((a, b) => b.confidence - a.confidence);

      console.log('Classification results:', results);
      console.log('Top prediction:', results[0]);
      console.log('Is confident:', results[0].confidence >= this.confidenceThreshold);

      return {
        success: true,
        predictions: results,
        topPrediction: results[0],
        isConfident: results[0].confidence >= this.confidenceThreshold
      };
      
    } catch (error) {
      console.error('Classification error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        imageInputType: typeof imageInput,
        isFile: imageInput instanceof File,
        isImageElement: imageInput instanceof HTMLImageElement,
        isCanvas: imageInput instanceof HTMLCanvasElement
      });
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
