/**
 * Tool Descriptions Database
 * 
 * This file contains detailed descriptions, features, and metadata
 * for various DIY tools that can be auto-populated based on
 * image classification results.
 */

export const toolDescriptions = {
  // Power Tools
  'Cordless drill': {
    title: 'Cordless Drill',
    description: 'Versatile cordless power tool for drilling holes and driving screws. Perfect for woodworking, construction, and DIY projects. Features variable speed control and comes with multiple drill bits for different materials.',
    category: 'Power Tools',
    subcategory: 'Drills',
    features: [
      'Variable speed control for precision work',
      'Rechargeable lithium-ion battery',
      'Multiple drill bits included (wood, metal, masonry)',
      'LED work light for better visibility',
      'Ergonomic grip for comfortable use',
      'Cordless operation for portability'
    ],
    safetyNotes: [
      'Always wear safety glasses when drilling',
      'Ensure workpiece is securely clamped',
      'Check battery charge before starting work',
      'Use appropriate drill bit for material type',
      'Keep hands away from rotating parts',
      'Store battery in cool, dry place'
    ],
    commonUses: [
      'Drilling holes in wood, metal, and masonry',
      'Driving screws and bolts',
      'Installing hardware and fixtures',
      'Building furniture and structures',
      'Home improvement projects',
      'Electrical work and installations'
    ],
    rentalTips: [
      'Check battery life and charging capability',
      'Test all speed settings and torque control',
      'Verify all drill bits are included',
      'Ask about battery replacement policy',
      'Test LED work light functionality'
    ]
  },

  'Circular saw': {
    title: 'Circular Saw',
    description: 'Powerful cutting tool for making straight cuts in wood, plywood, and other materials. Essential for construction and woodworking projects.',
    category: 'Power Tools',
    subcategory: 'Saws',
    features: [
      'Adjustable cutting depth',
      'Bevel cutting capability',
      'Electric motor with high torque',
      'Safety guard for blade protection',
      'Dust collection port',
      'Precision cutting guide'
    ],
    safetyNotes: [
      'Always use safety glasses and hearing protection',
      'Ensure blade is sharp and properly installed',
      'Keep both hands on the tool during operation',
      'Never cut freehand - use a guide or fence',
      'Disconnect power before changing blades',
      'Check blade guard operation before use'
    ],
    commonUses: [
      'Cutting lumber to length',
      'Making straight cuts in plywood',
      'Construction and framing work',
      'DIY furniture projects',
      'Deck building and repairs',
      'Rip cutting and cross cutting'
    ],
    rentalTips: [
      'Check blade condition and sharpness',
      'Test safety guard operation',
      'Verify cutting depth adjustments work',
      'Ask about blade replacement policy',
      'Test bevel cutting capability'
    ]
  },

  // Hand Tools
  'Hammer': {
    title: 'Claw Hammer',
    description: 'Essential hand tool for driving nails, breaking objects, and general construction work. Features a curved claw for nail removal.',
    category: 'Hand Tools',
    subcategory: 'Hammers',
    features: [
      'Ergonomic rubber grip for comfort',
      'Claw design for nail removal',
      'Durable steel head construction',
      'Balanced weight for efficient striking',
      'Magnetic nail starter (on some models)',
      'Shock-absorbing handle'
    ],
    safetyNotes: [
      'Use appropriate hammer weight for the task',
      'Check handle for cracks or damage',
      'Wear safety glasses when striking',
      'Keep striking face clean and smooth',
      'Store safely to prevent accidents',
      'Don\'t use as a pry bar'
    ],
    commonUses: [
      'Driving nails into wood',
      'Removing nails with claw',
      'Breaking apart materials',
      'General construction work',
      'Furniture assembly',
      'Demolition work'
    ],
    rentalTips: [
      'Check handle for damage or cracks',
      'Test grip comfort and balance',
      'Verify claw is not bent or damaged',
      'Ask about replacement handle policy',
      'Test magnetic nail starter if present'
    ]
  },

  'Spanner - Wrench': {
    title: 'Adjustable Spanner/Wrench',
    description: 'Versatile tool for tightening and loosening nuts and bolts of various sizes. Features an adjustable jaw that can accommodate different fastener sizes.',
    category: 'Hand Tools',
    subcategory: 'Wrenches',
    features: [
      'Adjustable jaw width for multiple sizes',
      'Strong steel construction',
      'Non-slip grip handle',
      'Precision-machined jaws',
      'Compact design for tight spaces',
      'Wide opening capacity'
    ],
    safetyNotes: [
      'Ensure proper fit on fastener',
      'Pull towards you when possible',
      'Don\'t use as a hammer or pry bar',
      'Check for jaw wear and damage',
      'Use appropriate size for the task',
      'Keep jaws clean and lubricated'
    ],
    commonUses: [
      'Tightening and loosening nuts and bolts',
      'Plumbing repairs and installations',
      'Automotive maintenance',
      'Furniture assembly',
      'General mechanical work',
      'Pipe fitting and connections'
    ],
    rentalTips: [
      'Test jaw adjustment mechanism',
      'Check for jaw wear or damage',
      'Verify handle grip is secure',
      'Ask about size range capabilities',
      'Test on various fastener sizes'
    ]
  },

  // Garden/Outdoor Tools
  'Lawnmower': {
    title: 'Lawn Mower',
    description: 'Essential garden tool for maintaining lawn grass at an even height. Available in electric, cordless, and petrol models for different lawn sizes.',
    category: 'Garden Tools',
    subcategory: 'Lawn Care',
    features: [
      'Adjustable cutting height',
      'Mulching capability (on some models)',
      'Grass collection bag',
      'Easy-start mechanism',
      'Ergonomic handle design',
      'Safety features and guards'
    ],
    safetyNotes: [
      'Always wear sturdy footwear',
      'Clear lawn of debris before mowing',
      'Never mow wet grass',
      'Keep hands and feet away from blades',
      'Disconnect power before maintenance',
      'Store fuel safely (petrol models)'
    ],
    commonUses: [
      'Regular lawn maintenance',
      'Grass height control',
      'Lawn edging and trimming',
      'Seasonal garden preparation',
      'Property maintenance',
      'Landscaping projects'
    ],
    rentalTips: [
      'Check blade sharpness and condition',
      'Test starting mechanism',
      'Verify grass collection system',
      'Ask about fuel type and requirements',
      'Test height adjustment settings',
      'Check safety features and guards'
    ]
  },

  // Access Equipment
  'Ladder': {
    title: 'Ladder',
    description: 'Essential access equipment for reaching heights safely. Available in various types including step ladders, extension ladders, and platform ladders.',
    category: 'Access Equipment',
    subcategory: 'Ladders',
    features: [
      'Non-slip feet for stability',
      'Locking mechanisms for safety',
      'Durable aluminum or fiberglass construction',
      'Weight capacity rating',
      'Compact storage design',
      'Safety labels and instructions'
    ],
    safetyNotes: [
      'Always maintain three points of contact',
      'Set up on level, stable ground',
      'Don\'t exceed weight capacity',
      'Inspect for damage before use',
      'Use appropriate ladder for the task',
      'Never stand on top rung'
    ],
    commonUses: [
      'Painting and decorating',
      'Cleaning gutters and windows',
      'Roof maintenance and repairs',
      'Light fixture installation',
      'Tree trimming and pruning',
      'General maintenance tasks'
    ],
    rentalTips: [
      'Check for damage or wear',
      'Test locking mechanisms',
      'Verify weight capacity rating',
      'Ask about setup and safety instructions',
      'Check non-slip feet condition',
      'Test extension mechanism (if applicable)'
    ]
  },

  // Default fallback
  'other': {
    title: 'Tool',
    description: 'General purpose tool for various DIY and construction tasks. Please check the specific features and safety requirements for this tool.',
    category: 'General Tools',
    subcategory: 'Other',
    features: [
      'Versatile use for multiple applications',
      'Durable construction',
      'Professional quality'
    ],
    safetyNotes: [
      'Read manufacturer instructions carefully',
      'Use appropriate safety equipment',
      'Store safely when not in use',
      'Check for damage before use',
      'Follow proper operating procedures'
    ],
    commonUses: [
      'General DIY projects',
      'Construction work',
      'Home maintenance',
      'Repair tasks'
    ],
    rentalTips: [
      'Ask about specific tool features',
      'Request operating instructions',
      'Check for any damage or wear',
      'Verify all accessories are included'
    ]
  }
};

/**
 * Get tool description by class name
 * @param {string} className - The classified tool name
 * @returns {Object} Tool description object
 */
export const getToolDescription = (className) => {
  return toolDescriptions[className] || toolDescriptions.other;
};

/**
 * Get all available tool categories
 * @returns {Array<string>} Array of category names
 */
export const getToolCategories = () => {
  const categories = new Set();
  Object.values(toolDescriptions).forEach(tool => {
    categories.add(tool.category);
  });
  return Array.from(categories);
};

/**
 * Get tools by category
 * @param {string} category - The category name
 * @returns {Array<Object>} Array of tools in the category
 */
export const getToolsByCategory = (category) => {
  return Object.entries(toolDescriptions)
    .filter(([_, tool]) => tool.category === category)
    .map(([key, tool]) => ({ key, ...tool }));
};

export default toolDescriptions;
