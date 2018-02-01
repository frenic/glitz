import { Style } from '@glitz/type';
import Base from '../core/Base';
import { validateMixingShorthandLonghand } from '../utils/mixing-shorthand-longhand';

export let createValidator: () => typeof Base = () => Base;

if (process.env.NODE_ENV !== 'production') {
  createValidator = () =>
    class extends Base {
      public injectStyle(style: Style) {
        const classNames = super.injectStyle(style);
        validateMixingShorthandLonghand(style, classNames);
        return classNames;
      }
    };
}

export default createValidator;
