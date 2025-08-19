import { afterEach, vi } from 'vitest';

// Reusable HTTP method spies
const httpGet = vi.fn();
const httpPost = vi.fn();
const httpPut = vi.fn();
const httpPatch = vi.fn();
const httpDelete = vi.fn();

// Global mock for the axios wrapper used in the app
vi.mock('@/api/requests', () => {
  return {
    default: {
      get $http() {
        return {
          get: httpGet,
          post: httpPost,
          put: httpPut,
          patch: httpPatch,
          delete: httpDelete,
        };
      },
    },
  };
});

// Reset all mocks between tests to avoid cross-test interference
afterEach(() => {
  vi.clearAllMocks();
});
