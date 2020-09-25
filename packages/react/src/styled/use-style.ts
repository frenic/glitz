import { StyleOrStyleArray } from '@glitz/type';
import { StyledDecorator } from './decorator';
import useGlitz from './use-glitz';

export default function useStyle(styles?: StyleOrStyleArray | StyledDecorator) {
  const [apply] = useGlitz(styles);
  return apply();
}
