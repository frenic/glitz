import { Style, CommonValue, CommonDeclarations, ResolvedValue, ResolvedDeclarations } from '../..';

const css: Style = {
  gridColumnStart: '',
  gridColumn: { start: '' },
  grid: {
    column: {
      start: '',
    },
  },
  ':hover': {
    gridColumnStart: '',
    grid: {
      column: {
        start: '',
      },
    },
  },
  '@keyframes': {
    from: {
      gridColumnStart: '',
      grid: {
        column: {
          start: '',
        },
      },
    },
  },
  animationName: {
    from: {
      gridColumnStart: '',
      grid: {
        column: {
          start: '',
        },
      },
    },
  },
  '@font-face': {
    fontFamily: '',
    fontVariant: [''],
  },
  fontFamily: {
    fontFamily: '',
    fontVariant: [''],
  },
  border: {
    y: { x: { radius: 0 }, left: { radius: 0 }, right: { radius: 0 } },
    top: { x: { radius: 0 } },
    bottom: { x: { radius: 0 } },
  },
};

const commonValue: CommonValue = '' as CommonDeclarations[keyof CommonDeclarations];
const resolvedValue: ResolvedValue = '' as ResolvedDeclarations[keyof ResolvedDeclarations];

// Avoid unread variables type error
css;
commonValue;
resolvedValue;
