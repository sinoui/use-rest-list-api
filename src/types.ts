import { HttpResponse, HttpRequestConfig } from '@sinoui/http';

/**
 * 排序信息
 */
export interface SortInfo {
  /**
   * 排序方式，`desc`表示降序，`asc`表示升序
   */
  direction: 'desc' | 'asc';
  /**
   * 指定排序字段
   */
  property: string;
}

/**
 * useRestListApi配置信息
 */
export interface Options<T> {
  /**
   * 指定`curd api`的基础`url`，如果不指定，则默认为`url`
   */
  baseUrl?: string;
  /**
   * 指定排序字段
   */
  defaultSort?: SortInfo[];
  /**
   * 指定默认查询条件
   */
  defaultSearchParams?: { [x: string]: string };
  /**
   * 是否同步查询条件与浏览器URL，默认为`false`
   */
  syncToUrl?: boolean;
  /**
   * 指定唯一键属性名，默认为`id`
   */
  keyName?: string;
  /**
   * 是否启动删除多条数据的 API。默认为`true`，表示启用。
   */
  useMultiDeleteApi?: boolean;
  /**
   * 指定列表查询结果的转换器
   */
  transformListReponse?: (response: HttpResponse) => any;
  /**
   * 指定查询条件转换器
   */
  transformListRequest?: (
    searchParams?: { [x: string]: string },
    sorts?: { sorts?: SortInfo[] },
  ) => void;
  /**
   * 指定获取单条数据的响应数据转换器
   */
  transformFetchOneResponse?: (response: HttpResponse) => T;
  /**
   * 指定新增数据的请求数据转换器
   */
  transformSaveRequest?: (request: HttpRequestConfig) => T;
  /**
   * 指定新增数据的响应数据转换器
   */
  transformSaveResponse?: (response: HttpResponse) => T;
  /**
   * 指定更新数据的请求数据转换器
   */
  transformUpdateRequest?: (request: HttpRequestConfig) => void;
  /**
   * 指定更新数据的响应数据转换器
   */
  transformUpdateResponse?: (response: HttpResponse) => T;
}
