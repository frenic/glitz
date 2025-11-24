import { Globals, Style, Theme } from '../style';
import { Base, createStyleInjectors } from '../core/create-style-injectors';
import { DEFAULT_HYDRATION_IDENTIFIER, Options } from '../options';
import { createHashCounter, createHashCountsFromStringList } from '../utils/hash';
import InjectorServer from './InjectorServer';
import { createHydrate } from '../utils/hydrate';
import { formatMediaRule } from '../utils/format';

export type Diagnostic = {
  message: string;
  severity: 'error' | 'warning' | 'info';
  file: string;
  line: number;
  innerDiagnostic?: Diagnostic;
};

export default class GlitzServer<TStyle extends Style = Style> implements Base<TStyle> {
  public identifier: string;
  public diagnostics: Diagnostic[] = [];
  public injectStyle: (styles: TStyle | readonly TStyle[], theme?: Theme) => string;
  public injectGlobals: (styles: Globals, theme?: Theme) => void;
  public hydrate: (css: string) => void;
  public getStyle: (markup?: boolean, stream?: boolean) => string;
  public clone: () => GlitzServer<TStyle>;
  constructor(options?: Options);
  constructor(
    options: Options = {},
    classNameHash = createHashCounter(options.prefix, createHashCountsFromStringList(options.disallowedClassNames)),
    keyframesHash = createHashCounter(options.prefix, createHashCountsFromStringList(options.disallowedClassNames)),
    plainInjector?: InjectorServer,
    mediaInjectors: Record<string, InjectorServer> = {},
  ) {
    const identifier = (this.identifier = options.identifier ?? DEFAULT_HYDRATION_IDENTIFIER);

    const getInjector = (media?: string) =>
      media
        ? (mediaInjectors[media] ??= new InjectorServer(classNameHash, keyframesHash))
        : (plainInjector ??= new InjectorServer(classNameHash, keyframesHash));

    const [injectStyle, injectGlobals] = createStyleInjectors(getInjector, options.transformer);

    this.injectStyle = injectStyle;

    this.injectGlobals = injectGlobals;

    this.hydrate = createHydrate(getInjector);

    this.getStyle = (markup = false, stream = false) => {
      let result = '';

      if (plainInjector) {
        const style = plainInjector.getStyle(stream);
        result += markup ? `<style data-${identifier}>${style}</style>` : style;
      }

      let queries = Object.keys(mediaInjectors);
      if (options.mediaOrder) {
        queries = queries.sort(options.mediaOrder);
      }

      for (const query of queries) {
        const style = mediaInjectors[query].getStyle(stream);
        if (style) {
          result += markup
            ? `<style data-${identifier} media="${query}">${style}</style>`
            : formatMediaRule(query, style);
        }
      }

      return result;
    };

    this.clone = () => {
      const classNameHashClone = classNameHash.clone();
      const keyframesHashClone = keyframesHash.clone();

      const mediaInjectorsClone: Record<string, InjectorServer> = {};
      for (const media in mediaInjectors) {
        mediaInjectorsClone[media] = mediaInjectors[media].clone(classNameHashClone, keyframesHashClone);
      }

      return new (GlitzServer as any)(
        options,
        classNameHashClone,
        keyframesHashClone,
        plainInjector?.clone(classNameHashClone, keyframesHashClone),
        mediaInjectorsClone,
      );
    };
  }
}
