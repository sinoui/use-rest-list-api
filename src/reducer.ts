/* eslint-disable @typescript-eslint/no-explicit-any */
import { produce } from 'immer';
import { SortInfo } from './types';

export interface Action {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

export interface State<T> {
  isError: boolean;
  isLoading: boolean;
  items: T[];
  searchParams?: { [x: string]: string };
  sorts?: SortInfo[];
}
/**
 * 更新数据时更新state
 *
 * @template T
 * @param {State<T>} state
 * @param {Action} action
 * @returns
 */
function updateItem<T>(state: State<T>, action: Action) {
  const idx = state.items.findIndex(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any) =>
      item[action.payload.keyName] ===
      action.payload.item[action.payload.keyName],
  );

  if (idx !== -1) {
    const newItems = [
      ...state.items.slice(0, idx),
      action.payload.item,
      ...state.items.slice(idx + 1),
    ];

    return {
      ...state,
      items: newItems,
    };
  }

  return state;
}

/**
 * 删除数据
 *
 * @template T
 * @param {State<T>} state
 * @param {Action} action
 * @returns
 */
function removeItem<T>(state: State<T>, action: Action) {
  const items = state.items.filter(
    (_item, index: number) => !action.payload.includes(index),
  );

  return {
    ...state,
    items,
  };
}

/**
 * 设置部分字段
 *
 * @param draft 状态
 * @param action 动作
 */
const setItem = produce(<T>(draft: State<T>, action: Action) => {
  const { itemId, extraItemInfo, keyName } = action.payload;
  const index = draft.items.findIndex((item: any) => item[keyName] === itemId);
  if (index !== -1) {
    const newItem = { ...(draft.items as any)[index], ...extraItemInfo };
    (draft.items as any)[index] = newItem;
  }
});

/**
 * 通过id删除数据项
 */
const removeItemById = produce(<T>(draft: State<T>, action: Action) => {
  const { itemIds, keyName } = action.payload;
  itemIds.forEach((itemId: string) => {
    const idx = draft.items.findIndex((item: any) => item[keyName] === itemId);
    if (idx !== -1) {
      draft.items.splice(idx, 1);
    }
  });
});

/**
 * 获取数据的reducer
 *
 * @param state 状态
 * @param action 动作
 */
function reducer<T = any>(state: State<T>, action: Action): State<T> {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isError: false,
        isLoading: true,
        searchParams: action.payload,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        items: action.payload ? [...action.payload.content] : [...state.items],
        sorts: action.payload ? action.payload.sorts : state.sorts,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isError: true,
        isLoading: false,
      };
    case 'UPDATE_ITEM':
      return updateItem(state, action);
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case 'REMOVE_ITEM':
      return removeItem(state, action);
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload,
      };
    case 'SET_ITEM':
      return setItem(state, action);
    case 'REMOVE_ITEM_BY_ID':
      return removeItemById(state, action);
    default:
      return state;
  }
}

export default reducer;
