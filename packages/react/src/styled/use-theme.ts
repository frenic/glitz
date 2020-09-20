import { useContext } from 'react';
import { ThemeContext } from '../components/context';

export default function useTheme() {
  return useContext(ThemeContext);
}
