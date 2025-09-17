# TensorFlow.js Model Setup

This directory contains the TensorFlow.js model files for image classification.

## Model Files Required

Place your Teachable Machine model files in this directory:

- `model.json` - Model architecture and metadata
- `metadata.json` - Additional model information (optional)
- `weights.bin` - Model weights

## Model Setup Instructions

1. **Export from Teachable Machine:**
   - Go to your Teachable Machine project
   - Click "Export Model"
   - Choose "TensorFlow.js" format
   - Download the model files

2. **Place Files:**
   - Copy `model.json` to this directory
   - Copy `weights.bin` to this directory
   - If you have `metadata.json`, copy it here too

3. **Update Class Labels:**
   - Edit `src/services/imageClassification.js`
   - Update the `getClassLabels()` method with your model's class names
   - Make sure the order matches your Teachable Machine training

4. **Update Tool Descriptions:**
   - Edit `src/data/toolDescriptions.js`
   - Add descriptions for each class your model recognizes
   - Include features, safety notes, and usage tips

## Example Model Structure

```
public/models/
├── model.json          # Model architecture
├── weights.bin         # Model weights
├── metadata.json       # Optional metadata
└── README.md          # This file
```

## Model Classes

Your model should be trained to recognize these tool categories:

- drill
- hammer
- saw
- wrench
- screwdriver
- pliers
- level
- tape_measure
- other

## Testing Your Model

1. Start the development server: `yarn dev`
2. Go to the listing creation page
3. Upload an image of a tool
4. Check the browser console for classification results
5. Verify that the correct tool description is suggested

## Troubleshooting

### Model Not Loading
- Check browser console for errors
- Verify file paths are correct
- Ensure model files are accessible via HTTP

### Low Accuracy
- Retrain your model with more diverse images
- Add more training examples for each class
- Consider data augmentation techniques

### Classification Errors
- Verify class labels match your training
- Check image preprocessing matches training data
- Ensure model input size is correct (224x224 by default)

## Performance Tips

- Use WebGL backend for better performance
- Consider model quantization for smaller file sizes
- Implement caching for repeated classifications
- Add loading states for better UX

## Security Notes

- Model files are publicly accessible
- Don't include sensitive training data in metadata
- Consider model versioning for updates
- Monitor model performance in production
