import { Style } from '@glitz/type';
import { StyledDecorator } from './decorator';
import useGlitz from './use-glitz';

export default function useStyle(styles?: Style | Style[] | StyledDecorator) {
  const [apply] = useGlitz(styles);
  return apply();
}
