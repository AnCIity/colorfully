/**
 * CSS 样式变量
 */
export interface CSSStyleVariable {
  /**
   * 名称
   */
  name: string;
  /**
   * 代码
   */
  code: string;
  /**
   * 值
   */
  value: string;
}

/**
 * CSS 样式类型
 */
export class CSSStyleType {
  /**
   * 名称
   */
  name: string;

  /**
   * 代码
   */
  code: string;

  /**
   * 类型样式映射
   */
  map: Record<string, CSSStyleVariable>;

  constructor(name: string, code: string, map: Record<string, CSSStyleVariable>) {
    this.name = name;
    this.code = code;
    this.map = map;
  }

  /**
   * 获取所有类型变量
   */
  getAll() {
    return Object.values(this.map) as Array<CSSStyleVariable>;
  }

  /**
   * 获取某一类型变量
   */
  get(code: string) {
    return this.map[code];
  }

  /**
   * 创建类型变量
   */
  create(name: string, code: string, value: string) {
    this.map[code] = { name, code, value };
  }

  /**
   * 删除类型变量
   */
  delete(code: string) {
    delete this.map[code];
  }

  /**
   * 修改类型变量
   */
  change(code: string, value: string) {
    this.map[code].value = value;
  }
}

/**
 * CSS 样式
 */
export class CSSStyle<T extends string> {
  /**
   * 名称
   */
  name: string;

  /**
   * 代码
   */
  code: string;

  /**
   * 样式映射
   */
  map: {
    [K in T | (string & Record<never, never>)]: CSSStyleType;
  };

  constructor(
    name: string,
    code: string,
    map: {
      [K in T]: {
        name: string;
        code: string;
        variables: Record<string, CSSStyleVariable>;
      };
    }
  ) {
    this.name = name;
    this.code = code;
    this.map = Object.keys(map).reduce((m, type) => {
      const item = map[type as keyof typeof map] as any;
      m[type] = new CSSStyleType(item.name, item.code, item.variables);
      return m;
    }, {} as any) as typeof this.map;
  }

  /**
   * 获取所有样式类型
   */
  getAll() {
    return Object.values(this.map) as Array<CSSStyleType>;
  }

  /**
   * 获取某一样式类型
   */
  get<K extends T | (string & Record<never, never>)>(type: K): CSSStyleType {
    return this.map[type];
  }

  /**
   * 创建样式类型
   */
  create(name: string, code: string, map: Record<string, CSSStyleVariable>) {
    this.map[code as T] = new CSSStyleType(name, code, map) as any;
  }

  /**
   * 删除样式类型
   */
  delete(type: T | (string & Record<never, never>)) {
    delete this.map[type];
  }

  /**
   * 包裹样式类型
   */
  parcel(type: T | (string & Record<never, never>), value: string) {
    return `*[ data-theme-${this.code} = '${String(type)}' ] {
${value}
}`;
  }

  /**
   * 生成样式类型字符串
   */
  toTypeString(type: T | (string & Record<never, never>)) {
    return this.get(type)
      .getAll()
      .map(variable => `${variable.code}: ${variable.value};`)
      .join('\n');
  }

  /**
   * 生成样式字符串
   */
  toString() {
    return this.getAll()
      .map(type => this.parcel(type.code, this.toTypeString(type.code)))
      .join('\n\n');
  }
}
