import Base from '../core/Base';
import { validateMixingShorthandLonghand } from '../utils/mixing-shorthand-longhand';

export let createValidator: () => typeof Base = () => Base;

if (process.env.NODE_ENV !== 'production') {
  createValidator = <TStyle>() =>
    class extends Base<TStyle> {
      public injectStyle(style: TStyle) {
        const classNames = super.injectStyle(style);
        validateMixingShorthandLonghand(style, classNames);
        return classNames;
      }
    };
}

export default createValidator;
