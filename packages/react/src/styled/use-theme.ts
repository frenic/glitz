import { use } from 'react';
import { ThemeContext } from '../components/context';

export default function useTheme() {
  return use(ThemeContext);
}
