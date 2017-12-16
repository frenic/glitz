(global as any).requestAnimationFrame = (callback: () => any) => setTimeout(callback, 0);

import { configure } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
