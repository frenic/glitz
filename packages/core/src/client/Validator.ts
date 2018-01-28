import { Style } from '@glitz/type';
import Base from '../core/Base';
import { validateMixingShorthandLonghand } from '../utils/mixing-shorthand-longhand';

export default class Validator extends Base {
  public injectStyle(style: Style) {
    const classNames = super.injectStyle(style);
    validateMixingShorthandLonghand(style, classNames);
    return classNames;
  }
}
