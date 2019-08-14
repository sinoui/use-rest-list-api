/* eslint-disable @typescript-eslint/no-explicit-any */
import { useReducer, useCallback, useRef, useEffect } from 'react';
import http from '@sinoui/http';
import qs from 'qs';
import { Options, SortInfo } from './types';
import reducer, { Reducer } from './reducer';
import getSearchParams from './getSearchParams';
import useEffect2 from './useEffect2';

/**
 * 从history中获取查询参数
 */
function getSearchParamsFromLocation() {
  const { search } = window.location;

  if (search && search.length > 1) {
    return qs.parse(window.location.search.substr(1));
  }
  return null;
}

function useRestListApi<T, RawResponse = T[]>(
  url: string,
  defaultValue: T[] = [],
  options?: Options<T>,
) {
  const rawResponseRef = useRef<RawResponse>();

  const {
    keyName = 'id',
    syncToUrl,
    defaultSearchParams,
    baseUrl = url,
    transformListRequest,
    transformListReponse,
    transformFetchOneResponse,
    transformSaveRequest,
    transformSaveResponse,
    transformUpdateRequest,
    transformUpdateResponse,
    transformRemoveResponse,
  } = (options || {}) as Options<T>;
  const defaultSorts = (options && options.defaultSort) || [];

  const [state, dispatch] = useReducer<Reducer<T>>(reducer, {
    isError: false,
    isLoading: false,
    items: defaultValue,
    sorts: defaultSorts,
    searchParams: syncToUrl
      ? getSearchParamsFromLocation() || defaultSearchParams
      : defaultSearchParams,
  });

  const doFetch = useCallback(
    async (
      sorts?: SortInfo[],
      searchParams?: { [x: string]: string },
    ): Promise<T[]> => {
      dispatch({ type: 'FETCH_INIT', payload: searchParams });

      try {
        const params = transformListRequest
          ? transformListRequest(searchParams, { sorts })
          : getSearchParams(sorts, searchParams);

        const requestUrl =
          // eslint-disable-next-line no-nested-ternary
          params && Object.keys(params).length !== 0
            ? url.includes('?')
              ? `${url}&${params}`
              : `${url}?${params}`
            : url;

        const response = await http.get<T[]>(requestUrl);

        const result = transformListReponse
          ? transformListReponse(response)
          : response;

        dispatch({
          type: 'FETCH_SUCCESS',
          payload: { content: result, sorts },
        });
        rawResponseRef.current = result as any;
        return result;
      } catch (e) {
        dispatch({ type: 'FETCH_FAILURE' });
        throw e;
      }
    },
    [transformListReponse, transformListRequest, url],
  );

  useEffect2(() => {
    const searchParams = syncToUrl
      ? getSearchParamsFromLocation() || defaultSearchParams
      : defaultSearchParams;
    doFetch(defaultSorts, searchParams);
  }, [url]);

  useEffect(() => {
    if (!syncToUrl) {
      return;
    }
    const search = `?${qs.stringify(state.searchParams)}`;
    if (search !== window.location.search) {
      window.history.pushState(window.history.state, document.title, search);
    }
  }, [state.searchParams, syncToUrl]);

  /**
   * 获取数据
   *
   * @param {number} pageNo 页码
   * @returns
   */
  function fetch(
    sorts: SortInfo[] | undefined = state.sorts,
    searchParams: { [x: string]: string } | undefined = state.searchParams,
  ): Promise<T[]> {
    return doFetch(sorts, {
      ...searchParams,
    });
  }

  /**
   * 列表排序
   *
   * @param {SortInfo[]} sorts
   * @returns {Promise<PageResponse<T>>}
   */
  const sortWith = useCallback(
    (sorts: SortInfo[]): Promise<T[]> => {
      return doFetch(sorts);
    },
    [doFetch],
  );

  /**
   * 获取指定id的数据
   *
   * @param {string} itemId
   * @returns {T}
   */
  function getItemById(itemId: string): T | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return state.items.find((item: any) => item[keyName] === itemId);
  }

  /**
   * 更新数据
   *
   * @param {T} item
   * @returns {T}
   */
  const updateItem = useCallback(
    (item: T): T => {
      dispatch({ type: 'UPDATE_ITEM', payload: { item, keyName } });

      return item;
    },
    [keyName],
  );

  /**
   * 更新指定数据的部分字段
   *
   * @param {string} itemId 数据key值
   * @param {T} itemInfo 要更新的字段信息
   */
  const setItem = useCallback(
    (itemId: string, itemInfo: Partial<T>) => {
      dispatch({
        type: 'SET_ITEM',
        payload: { extraItemInfo: itemInfo, keyName, itemId },
      });
    },
    [keyName],
  );

  /**
   * 替换数据
   *
   * @param {T[]} itemsInfo
   */
  const setItems = useCallback((itemsInfo: T[]) => {
    dispatch({ type: 'SET_ITEMS', payload: itemsInfo });
  }, []);

  /**
   * 新增一条列表数据
   *
   * @param {T} item
   */
  const addItem = useCallback((item: T, idx: number = -1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { item, idx },
    });
  }, []);

  /**
   * 根据id删除一条数据
   *
   * @param {string} itemId
   */
  const removeItemById = useCallback(
    (itemId: string) => {
      dispatch({
        type: 'REMOVE_ITEM_BY_ID',
        payload: { itemIds: [itemId], keyName },
      });
    },
    [keyName],
  );

  /**
   * 删除指定行的数据
   *
   * @param {number} index
   */
  const removeItemAt = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: [index] });
  }, []);

  /**
   * 删除多条数据
   *
   * @param {string[]} ids
   */
  const removeItemsByIds = useCallback(
    (ids: string[]) => {
      dispatch({
        type: 'REMOVE_ITEM_BY_ID',
        payload: { itemIds: ids, keyName },
      });
    },
    [keyName],
  );

  /**
   * 获取一条数据详情信息
   *
   * @param {string} id
   * @param {boolean} [isNeedUpdate=true]
   * @returns {Promise<T>}
   */
  const get = useCallback(
    async function get(id: string, isNeedUpdate: boolean = true): Promise<T> {
      try {
        const response: T = await http.get(`${baseUrl}/${id}`);
        const result = transformFetchOneResponse
          ? transformFetchOneResponse(response)
          : response;

        if (isNeedUpdate) {
          updateItem(result);
        }

        return result;
      } catch (error) {
        throw error;
      }
    },
    [baseUrl, transformFetchOneResponse, updateItem],
  );

  /**
   * 新增数据
   *
   * @param {T} itemInfo
   * @param {boolean} [isNeedUpdate=true]
   * @returns {Promise<T>}
   */
  const save = useCallback(
    async (
      itemInfo: T,
      isNeedUpdate: boolean = true,
      idx?: number,
    ): Promise<T> => {
      try {
        const info = transformSaveRequest
          ? transformSaveRequest(itemInfo)
          : itemInfo;
        const response: T = await http.post(baseUrl, info);
        const result = transformSaveResponse
          ? transformSaveResponse(response)
          : response;

        if (isNeedUpdate) {
          addItem(result, idx);
        }

        return result;
      } catch (error) {
        throw error;
      }
    },
    [addItem, baseUrl, transformSaveRequest, transformSaveResponse],
  );

  /**
   * 更新数据信息
   *
   * @param {T} itemInfo
   * @param {boolean} [isNeedUpdate=true]
   * @returns {Promise<T>}
   */
  const update = useCallback(
    async (itemInfo: T, isNeedUpdate: boolean = true): Promise<T> => {
      try {
        const info = transformUpdateRequest
          ? transformUpdateRequest(itemInfo)
          : (itemInfo as any);

        const response: T = await http.put(`${baseUrl}/${info[keyName]}`, info);

        const result = transformUpdateResponse
          ? transformUpdateResponse(response)
          : response;

        if (isNeedUpdate) {
          updateItem(result);
        }

        return result;
      } catch (error) {
        throw error;
      }
    },
    [
      baseUrl,
      keyName,
      transformUpdateRequest,
      transformUpdateResponse,
      updateItem,
    ],
  );

  const { useMultiDeleteApi = true } = options || {};
  /**
   * 删除数据
   *
   * @param {(string | string[])} ids
   * @param {boolean} [isNeedUpdate=true]
   * @returns {Promise<T>}
   */
  const remove = useCallback(
    async (
      ids: string | string[],
      isNeedUpdate: boolean = true,
    ): Promise<void> => {
      try {
        if (typeof ids !== 'string') {
          if (useMultiDeleteApi) {
            const response: T = await http.delete(
              `${baseUrl}/${ids.join(',')}`,
            );

            if (transformRemoveResponse) {
              transformRemoveResponse(response);
            }

            if (isNeedUpdate) {
              removeItemsByIds(ids);
            }
          }
        } else {
          const response: T = await http.delete(`${baseUrl}/${ids}`);

          if (transformRemoveResponse) {
            transformRemoveResponse(response);
          }

          if (isNeedUpdate) {
            removeItemById(ids as string);
          }
        }
      } catch (error) {
        throw error;
      }
    },
    [
      useMultiDeleteApi,
      baseUrl,
      transformRemoveResponse,
      removeItemsByIds,
      removeItemById,
    ],
  );

  /**
   * 查询数据
   *
   * @param {{ [x: string]: string }} searchParams
   * @returns
   */
  const query = useCallback(
    (searchParams: { [x: string]: string }) => {
      return doFetch(state.sorts, {
        ...searchParams,
      });
    },
    [doFetch, state.sorts],
  );

  /**
   * 重新加载数据
   *
   * @returns
   */
  const reload = useCallback(() => {
    return doFetch(state.sorts, state.searchParams);
  }, [doFetch, state.searchParams, state.sorts]);

  /**
   * 重置查询条件并完成一次查询
   *
   * @returns
   */
  const reset = useCallback(() => {
    return doFetch(state.sorts, defaultSearchParams);
  }, [defaultSearchParams, doFetch, state.sorts]);

  return {
    ...state,
    rawResponse: rawResponseRef.current,
    fetch,
    sortWith,
    getItemById,
    updateItem,
    setItem,
    setItems,
    addItem,
    removeItemById,
    removeItemAt,
    removeItemsByIds,
    get,
    save,
    update,
    remove,
    defaultSearchParams,
    query,
    reload,
    reset,
  };
}

export default useRestListApi;
