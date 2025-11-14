import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import createHttpClient from '@/api/http';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';

describe('api/http createHttpClient', () => {
  let mockClient: any;
  let onFulfilled: any;
  let onRejected: any;

  beforeEach(() => {
    setActivePinia(createPinia());

    onFulfilled = undefined;
    onRejected = undefined;
    mockClient = {
      interceptors: {
        response: {
          use: vi.fn((fulfilled: any, rejected: any) => {
            onFulfilled = fulfilled;
            onRejected = rejected;
          }),
        },
      },
    } as any;

    vi.spyOn(axios, 'create').mockReturnValue(mockClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates axios client with provided baseURL and Authorization header from auth store', () => {
    const auth = useAuthStore();
    auth.setToken('Bearer abc-token');

    const client = createHttpClient('https://api.example.com');

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'https://api.example.com',
      headers: {
        Authorization: 'Bearer abc-token',
      },
    });
    expect(client).toBe(mockClient);
    expect(mockClient.interceptors.response.use).toHaveBeenCalledTimes(1);
  });

  it('camelCases response.data deeply via response interceptor', async () => {
    const auth = useAuthStore();
    auth.setToken('abc-token');
    createHttpClient('https://api.example.com');

    const response = {
      data: {
        snake_case: 1,
        nested_key: {
          child_key: 2,
        },
        array_items: [{ item_id: 1 }, { item_id: 2 }],
      },
    };

    const transformed = await onFulfilled(response);
    expect(transformed.data).toEqual({
      snakeCase: 1,
      nestedKey: { childKey: 2 },
      arrayItems: [{ itemId: 1 }, { itemId: 2 }],
    });
  });

  it('forwards errors unchanged in interceptor reject path', async () => {
    const auth = useAuthStore();
    auth.setToken('abc-token');
    createHttpClient('https://api.example.com');

    const error = new Error('boom');
    await expect(onRejected(error)).rejects.toBe(error);
  });
});
