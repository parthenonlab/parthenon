import { useCallback } from 'react';

export const useFetch = () => {
  /**
   * Sends a DELETE request to the given URL.
   *
   * @param url - The endpoint to send the request to
   * @returns The parsed response body, or null on failure
   */
  const fetchDelete = useCallback(async <T>(url: string): Promise<T | null> => {
    try {
      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) throw new Error('Parthenon: DELETE Request Failed');

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, []);

  /**
   * Sends a GET request to the given URL.
   *
   * @param url - The endpoint to send the request to
   * @returns The parsed response body, or null on failure
   */
  const fetchGet = useCallback(async <T>(url: string): Promise<T | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Parthenon: GET Request Failed');

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, []);

  /**
   * Sends a GET request to the given URL and returns the response as an array.
   * Falls back to an empty array on failure.
   *
   * @param url - The endpoint to send the request to
   * @returns The parsed response body as an array, or an empty array on failure
   */
  const fetchGetArray = useCallback(async <T>(url: string): Promise<T[]> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Parthenon: GET Request Failed');

      const data = await response.json();
      return data as T[];
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  /**
   * Sends a PATCH request with a JSON payload to the given URL.
   *
   * @param url - The endpoint to send the request to
   * @param payload - The partial object to send as the request body
   * @returns The parsed response body, or null on failure
   */
  const fetchPatch = useCallback(
    async <TResponse, TPayload = Partial<TResponse>>(
      url: string,
      payload: TPayload,
    ): Promise<TResponse | null> => {
      try {
        const response = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Parthenon: PATCH Request Failed');

        const data = await response.json();
        return data as TResponse;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    [],
  );

  /**
   * Sends a POST request with a JSON payload to the given URL.
   *
   * @param url - The endpoint to send the request to
   * @param payload - The partial object to send as the request body
   * @returns The parsed response body, or null on failure
   */
  const fetchPost = useCallback(
    async <TResponse, TPayload = Partial<TResponse>>(
      url: string,
      payload: TPayload,
    ): Promise<TResponse | null> => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Parthenon: POST Request Failed');

        const data = await response.json();
        return data as TResponse;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    [],
  );

  return { fetchDelete, fetchGet, fetchGetArray, fetchPatch, fetchPost };
};
