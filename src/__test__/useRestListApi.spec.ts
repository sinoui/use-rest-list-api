/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from 'react-hooks-testing-library';
import http from '@sinoui/http';
import useRestListApi from '../useRestListApi';

jest.mock('@sinoui/http');

afterEach(() => {
  (http.get as jest.Mock).mockReset();
  (http.post as jest.Mock).mockReset();
  (http.put as jest.Mock).mockReset();
  (http.delete as jest.Mock).mockReset();
});

it('只有url时获取数据成功', async () => {
  (http.get as jest.Mock).mockResolvedValue([
    { userId: '1', userName: '张三' },
  ]);

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestListApi('/test'),
  );

  expect(result.current.items).toEqual([]);
  expect(result.current.isError).toBeFalsy();
  expect(result.current.isLoading).toBeTruthy();
  expect(result.current.sorts).toEqual([]);

  await waitForNextUpdate();

  expect(result.current.isLoading).toBeFalsy();
  expect(result.current.items[0]).toEqual({ userId: '1', userName: '张三' });
  expect(result.current.sorts).toEqual([]);
});

it('只有url参数时获取数据失败', async () => {
  (http.get as jest.Mock).mockRejectedValue(new Error('Async error'));

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestListApi('/test'),
  );

  expect(result.current.isError).toBeFalsy();

  await waitForNextUpdate();

  expect(result.current.isError).toBeTruthy();
});

it('添加默认的查询参数', async () => {
  (http.get as jest.Mock).mockResolvedValue([
    { userId: '1', userName: '张三', age: 27 },
    { userId: '2', userName: '李四', age: 20 },
  ]);

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestListApi('/test', [], { defaultSearchParams: { name: '张三' } }),
  );

  expect(result.current.items).toEqual([]);
  expect(result.current.isError).toBeFalsy();
  expect(result.current.isLoading).toBeTruthy();
  expect(result.current.sorts).toEqual([]);
  expect(result.current.searchParams).toEqual({ name: '张三' });

  await waitForNextUpdate();

  expect(result.current.isLoading).toBeFalsy();
  expect(result.current.items[0]).toEqual({
    userId: '1',
    userName: '张三',
    age: 27,
  });
  expect(result.current.sorts).toEqual([]);
  expect(result.current.searchParams).toEqual({ name: '张三' });
});

it('添加默认的排序字段', async () => {
  (http.get as jest.Mock).mockResolvedValue([
    { userId: '1', userName: '张三', age: 27 },
    { userId: '2', userName: '李四', age: 20 },
  ]);

  const { result } = renderHook(() =>
    useRestListApi('/test', [], {
      defaultSort: [{ property: 'name', direction: 'desc' }],
    }),
  );

  expect(result.current.items).toEqual([]);
  expect(result.current.isError).toBeFalsy();
  expect(result.current.isLoading).toBeTruthy();
  expect(result.current.sorts).toEqual([
    { property: 'name', direction: 'desc' },
  ]);
});

it('fetch方法获取数据', async () => {
  (http.get as jest.Mock)
    .mockResolvedValueOnce([
      { userId: '1', userName: '张三', age: 27 },
      { userId: '2', userName: '李四', age: 20 },
    ])
    .mockResolvedValueOnce([
      { userId: '1', userName: '张三', age: 27 },
      { userId: '2', userName: '李四', age: 20 },
      { userId: '3', userName: '王五', age: 20 },
    ]);
  const { result, waitForNextUpdate } = renderHook(() =>
    useRestListApi('/test'),
  );

  await waitForNextUpdate();
  expect(result.current.items[0]).toEqual({
    userId: '1',
    userName: '张三',
    age: 27,
  });

  await result.current.fetch([{ property: 'name', direction: 'desc' }], {
    name: '张三',
  });

  expect(result.current.items.length).toBe(3);
  expect(http.get).toHaveBeenCalledTimes(2);
  expect(result.current.searchParams).toEqual({ name: '张三' });
  expect(result.current.sorts).toEqual([
    { property: 'name', direction: 'desc' },
  ]);
});

it('列表排序', async () => {
  (http.get as jest.Mock)
    .mockReturnValueOnce([
      { userId: '2', userName: '李四', age: 20 },
      { userId: '1', userName: '张三', age: 27 },
    ])
    .mockResolvedValueOnce([
      { userId: '1', userName: '张三', age: 27 },
      { userId: '2', userName: '李四', age: 20 },
    ]);

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestListApi('/test'),
  );

  expect(result.current.sorts).toEqual([]);

  await waitForNextUpdate();

  await result.current.sortWith([
    { property: 'age', direction: 'desc' },
    { property: 'userId', direction: 'asc' },
  ]);

  expect(result.current.sorts).toEqual([
    { property: 'age', direction: 'desc' },
    { property: 'userId', direction: 'asc' },
  ]);
  expect(result.current.searchParams).toBeUndefined();
  expect(http.get).toBeCalledTimes(2);
});

it('更新部分数据', async () => {
  (http.get as jest.Mock).mockResolvedValue([
    { userId: '1', userName: '张三' },
  ]);

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestListApi<any>('/test', [], {
      keyName: 'userId',
    }),
  );

  await waitForNextUpdate();

  result.current.setItem('1', {
    userName: '张三2',
    age: 10,
  });

  expect(result.current.items[0]).toEqual({
    userId: '1',
    userName: '张三2',
    age: 10,
  });
});

it('通过id删除数据项', async () => {
  (http.get as jest.Mock).mockResolvedValue([
    { userId: '1', userName: '张三' },
  ]);

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestListApi<any>('/test', [], {
      keyName: 'userId',
    }),
  );

  await waitForNextUpdate();

  result.current.removeItemById('1');

  expect(result.current.items.length).toBe(0);
});

it('通过id删除一组数据项', async () => {
  (http.get as jest.Mock).mockResolvedValue([
    { userId: '1', userName: '张三' },
    { userId: '2', userName: '张三2' },
  ]);

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestListApi<any>('/test', [], {
      keyName: 'userId',
    }),
  );

  await waitForNextUpdate();

  result.current.removeItemsByIds(['1', '2', '0']);

  expect(result.current.items.length).toBe(0);
});

it('通过id删除第二条数据项', async () => {
  (http.get as jest.Mock).mockResolvedValue([
    { userId: '1', userName: '张三' },
    { userId: '2', userName: '张三' },
  ]);

  const { result, waitForNextUpdate } = renderHook(() =>
    useRestListApi<any>('/test', [], {
      keyName: 'userId',
    }),
  );

  await waitForNextUpdate();

  result.current.removeItemById('2');

  expect(result.current.items[0]).toEqual({ userId: '1', userName: '张三' });
});
