/**
 * Network request logger helper to monitor all outgoing fetch requests
 * with special focus on StudioFlow API calls for debugging connection issues.
 */
export const initNetworkLogger = () => {
  if (typeof window === 'undefined' || (window as any).__studioflow_logger_initialized) return;
  (window as any).__studioflow_logger_initialized = true;

  const originalFetch = window.fetch;
  if (!originalFetch) return;

  const patchedFetch = async function (...args: Parameters<typeof window.fetch>) {
    const [resource, config] = args;
    const url = typeof resource === 'string' ? resource : resource instanceof Request ? resource.url : String(resource);
    const method = (config as any)?.method || (resource instanceof Request ? resource.method : 'GET');
    
    const isStudioflow = url.includes('zilwgiuiygqqardzutxi.supabase.co') || url.includes('studioflow');
    const prefix = isStudioflow ? '🌐 [StudioFlow API Request]' : '📡 [Network Request]';

    console.groupCollapsed(`${prefix} ${method.toUpperCase()} ${url}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('URL:', url);
    console.log('Method:', method);
    if ((config as any)?.headers) console.log('Headers:', (config as any).headers);
    if ((config as any)?.body) console.log('Body:', (config as any).body);
    console.groupEnd();

    const startTime = performance.now();
    try {
      const response = await originalFetch.apply(window, args);
      const duration = Math.round(performance.now() - startTime);
      const clone = response.clone();
      
      let responseBody: any = '[Stream / Blob]';
      try {
        responseBody = await clone.json();
      } catch {
        try {
          responseBody = await clone.text();
        } catch {
          // ignore
        }
      }

      const resPrefix = isStudioflow ? '✅ [StudioFlow API Response]' : '📥 [Network Response]';
      console.groupCollapsed(`${resPrefix} (${response.status} ${response.statusText}) - ${duration}ms [${url}]`);
      console.log('Status:', response.status, response.statusText);
      console.log('Duration:', `${duration}ms`);
      console.log('Response Data:', responseBody);
      console.groupEnd();

      return response;
    } catch (error: any) {
      const duration = Math.round(performance.now() - startTime);
      const errPrefix = isStudioflow ? '❌ [StudioFlow API Error]' : '❌ [Network Error]';
      console.groupCollapsed(`${errPrefix} ${url} (${duration}ms)`);
      console.error('Error:', error);
      console.groupEnd();
      throw error;
    }
  };

  try {
    Object.defineProperty(window, 'fetch', {
      value: patchedFetch,
      writable: true,
      configurable: true,
    });
  } catch (e) {
    try {
      (window as any).fetch = patchedFetch;
    } catch (err) {
      console.warn('Could not override window.fetch:', err);
    }
  }

  console.log('🔍 [NetworkLogger] Initialized: Monitoring all outgoing network requests with StudioFlow API focus.');
};
