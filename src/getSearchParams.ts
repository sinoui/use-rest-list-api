import qs from 'qs';
import { SortInfo } from './types';

export default (sorts?: SortInfo[], searchParams?: { [x: string]: string }) => {
  return qs.stringify(
    {
      ...searchParams,
      sort: sorts
        ? sorts.map(
            (_sort) =>
              `${_sort.property}${_sort.direction === 'desc' ? ',desc' : ''}`,
          )
        : undefined,
    },
    {
      arrayFormat: 'repeat',
    },
  );
};
