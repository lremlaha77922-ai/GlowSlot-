import { describe, it, expect, vi } from 'vitest';
import { initNetworkLogger } from './networkLogger';

describe('Network Logger Helper', () => {
  it('initializes network logger without throwing errors', () => {
    expect(() => initNetworkLogger()).not.toThrow();
  });
});
