# Image Classification Integration Setup Guide

This guide explains how to set up and use the TensorFlow.js image classification feature for automatic tool description generation in your DIY tool sharing marketplace.

## 🎯 What We've Built

A complete image classification system that:
- ✅ Automatically classifies uploaded tool images using TensorFlow.js
- ✅ Suggests tool descriptions based on classification results
- ✅ Auto-populates listing form fields with relevant information
- ✅ Provides user-friendly interface for accepting/rejecting suggestions
- ✅ Includes comprehensive error handling and fallback mechanisms

## 📁 Files Created

### Core Services
- `apps/marketplace/src/services/imageClassification.js` - Main classification service
- `apps/marketplace/src/data/toolDescriptions.js` - Tool descriptions database
- `apps/marketplace/src/hooks/useImageClassification.js` - React hook for form integration

### Components
- `apps/marketplace/src/components/ImageClassification/ImageClassification.js` - Main UI component
- `apps/marketplace/src/components/ImageClassification/ImageClassification.css` - Styling
- `apps/marketplace/src/components/ImageClassification/ImageClassificationTest.js` - Test component
- `apps/marketplace/src/containers/EditListingPage/EditListingWizard/EditListingPhotosPanel/EditListingPhotosFormWithClassification.js` - Enhanced form

### Configuration
- `apps/marketplace/public/models/README.md` - Model setup instructions

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd apps/marketplace
yarn add @tensorflow/tfjs @tensorflow/tfjs-node
```

### 2. Prepare Your Model Files

1. **Export from Teachable Machine:**
   - Go to your Teachable Machine project
   - Click "Export Model"
   - Choose "TensorFlow.js" format
   - Download the model files

2. **Place Files in Public Directory:**
   ```
   apps/marketplace/public/models/
   ├── model.json          # Model architecture
   ├── weights.bin         # Model weights
   └── metadata.json       # Optional metadata
   ```

### 3. Update Class Labels

Edit `src/services/imageClassification.js` and update the `getClassLabels()` method:

```javascript
getClassLabels() {
  return [
    'drill',           // Update with your actual class names
    'hammer',          // Make sure order matches your model
    'saw',
    'wrench',
    'screwdriver',
    'pliers',
    'level',
    'tape_measure',
    'other'
  ];
}
```

### 4. Update Tool Descriptions

Edit `src/data/toolDescriptions.js` and add descriptions for each class your model recognizes:

```javascript
export const toolDescriptions = {
  drill: {
    title: 'Power Drill',
    description: 'Your custom description here...',
    category: 'Power Tools',
    // ... other properties
  },
  // Add descriptions for all your model classes
};
```

### 5. Integrate with Your Forms

Replace the standard photos form with the enhanced version:

```javascript
// In your EditListingPhotosPanel component
import EditListingPhotosFormWithClassification from './EditListingPhotosFormWithClassification';

// Use the enhanced form instead of the standard one
<EditListingPhotosFormWithClassification
  {...props}
  onClassificationComplete={handleClassificationComplete}
  onSuggestionAccepted={handleSuggestionAccepted}
  onSuggestionRejected={handleSuggestionRejected}
/>
```

## 🧪 Testing

### Option 1: Use the Test Component
Add the test component to any page for isolated testing:

```javascript
import ImageClassificationTest from '../components/ImageClassification/ImageClassificationTest';

// Add to your component
<ImageClassificationTest />
```

### Option 2: Test in Listing Flow
1. Start the development server: `yarn dev`
2. Go to the listing creation page
3. Upload an image of a tool
4. Watch for classification results and suggestions

## 🔧 Configuration Options

### Confidence Threshold
Adjust the minimum confidence for auto-population:

```javascript
// In imageClassification.js
this.confidenceThreshold = 0.7; // 70% confidence required
```

### Model Path
Change the model file location:

```javascript
// In imageClassification.js
this.modelPath = '/models/model.json'; // Default path
```

### Auto-Population Fields
Customize which fields get auto-populated:

```javascript
// In useImageClassification.js
const autoPopulateFields = useCallback((suggestion) => {
  // Customize field mapping here
  if (title) formApi.change('title', title);
  if (description) formApi.change('description', description);
  // Add more fields as needed
}, [formApi]);
```

## 🎨 Customization

### Styling
The component uses CSS custom properties for theming. Update colors in `ImageClassification.css`:

```css
:root {
  --colorSuccess: #10b981;
  --colorWarning: #f59e0b;
  --colorError: #ef4444;
  /* ... other colors */
}
```

### UI Text
All text is internationalized using `react-intl`. Add translations to your locale files:

```json
{
  "ImageClassification.classifying": "Analyzing image...",
  "ImageClassification.acceptSuggestion": "Use This Description",
  "ImageClassification.rejectSuggestion": "Write My Own"
}
```

## 🚨 Troubleshooting

### Model Not Loading
- ✅ Check browser console for errors
- ✅ Verify file paths are correct
- ✅ Ensure model files are accessible via HTTP
- ✅ Check CORS settings if serving from different domain

### Low Classification Accuracy
- ✅ Retrain your model with more diverse images
- ✅ Add more training examples for each class
- ✅ Consider data augmentation techniques
- ✅ Verify image preprocessing matches training data

### Performance Issues
- ✅ Use WebGL backend (enabled by default)
- ✅ Consider model quantization for smaller files
- ✅ Implement caching for repeated classifications
- ✅ Add loading states for better UX

### Integration Issues
- ✅ Check that form API is properly passed
- ✅ Verify field names match your form structure
- ✅ Ensure proper error handling in callbacks
- ✅ Test with different image formats and sizes

## 📊 Performance Considerations

### Model Size
- Keep model files under 10MB for good performance
- Consider quantization for production use
- Use model compression techniques

### Browser Compatibility
- Requires modern browsers with WebGL support
- Fallback to CPU processing if WebGL unavailable
- Consider progressive enhancement approach

### Memory Management
- Model is loaded once and reused
- Images are processed and disposed immediately
- Consider implementing model cleanup on page unload

## 🔮 Future Enhancements

### Potential Improvements
- [ ] Batch processing for multiple images
- [ ] Model versioning and A/B testing
- [ ] Confidence-based UI adjustments
- [ ] Integration with search and filtering
- [ ] Analytics and performance monitoring
- [ ] Offline support with service workers

### API Integration
- [ ] Move to backend processing for complex models
- [ ] Implement model caching and CDN distribution
- [ ] Add model performance monitoring
- [ ] Support for multiple model versions

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all setup steps are completed
3. Test with the provided test component
4. Review the troubleshooting section above

The implementation is designed to be robust and handle edge cases gracefully, but feel free to customize it for your specific needs!
