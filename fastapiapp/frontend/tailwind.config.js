const fs = require('fs');
const path = require('path');

const tokensPath = path.resolve(__dirname, 'tokens', 'design-system.json');
let tokens = {};
try {
  tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
} catch (e) {
  console.warn('Could not load design tokens:', e.message);
}

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,html}', './**/*.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: tokens.colors || {},
      borderRadius: {
        DEFAULT: tokens.rounded && tokens.rounded.DEFAULT ? tokens.rounded.DEFAULT : '0.5rem',
        lg: tokens.rounded && tokens.rounded.lg ? tokens.rounded.lg : '1rem',
        xl: tokens.rounded && tokens.rounded.xl ? tokens.rounded.xl : '1.5rem',
        full: tokens.rounded && tokens.rounded.full ? tokens.rounded.full : '9999px'
      },
      spacing: Object.fromEntries(Object.entries(tokens.spacing || {}).map(([k,v])=>[k, v])),
      fontFamily: {
        Inter: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      fontSize: {
        'display-lg': tokens.typography && tokens.typography['display-lg'] ? tokens.typography['display-lg'].fontSize : '72px',
        'headline-lg': tokens.typography && tokens.typography['headline-lg'] ? tokens.typography['headline-lg'].fontSize : '48px',
        'headline-md': tokens.typography && tokens.typography['headline-md'] ? tokens.typography['headline-md'].fontSize : '30px',
        'body-md': tokens.typography && tokens.typography['body-md'] ? tokens.typography['body-md'].fontSize : '16px'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
