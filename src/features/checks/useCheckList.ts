import { useMemo } from 'react';
import useFetch from 'react-fetch-hook';
import './CheckList.css';
import { CheckModel } from './CheckModel';

export function useCheckList() {
  const { isLoading, error, data } = useFetch<CheckModel[]>('/api/checks');

  const sorted = useMemo(() => {
    if (!data) {
      return [];
    }

    return [...data].sort((a, b) => a.priority - b.priority);
  }, [data]);

  return { isLoading, error, sorted };
}
