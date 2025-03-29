// Theme constants for SpiritBytes app

export const COLORS = {
  // Core brand colors
  oliveGreen: '#6d6941',
  earthBrown: '#8d6c45',
  terracotta: '#ae7e5c',
  sandBeige: '#c19e75',
  sageMoss: '#807b54',
  forestGreen: '#38523d',
  
  // UI Colors
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#E5E5E5',
  mediumGray: '#999999',
  darkGray: '#333333',
  
  // Gradient combinations
  splashGradient: ['#38523d', '#8d6c45'],
  accentGradient: ['#6d6941', '#c19e75'],
};

export const SIZES = {
  xSmall: 10,
  small: 12,
  medium: 16,
  large: 20,
  xLarge: 24,
  xxLarge: 32,
};

export const FONTS = {
  regular: 'Serif',
  medium: 'Serif-Medium',
  bold: 'Serif-Bold',
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  button: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  }
};

export default { COLORS, FONTS, SIZES, SHADOWS };