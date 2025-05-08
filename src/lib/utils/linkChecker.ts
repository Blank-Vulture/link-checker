// ✅ src/lib/utils/linkChecker.ts

export function calculateDelay(rtt: number): number {
    if (rtt < 1000) return 300;
    if (rtt < 3000) return 800;
    if (rtt < 6000) return 1500;
    return 3000;
  }
  
  export function smartDelay(url: string, rtt: number): number {
    try {
      const parsedUrl = new URL(url);
      const allowedHosts = ['researchgate.net', 'www.researchgate.net'];
      if (allowedHosts.includes(parsedUrl.host)) return 4000;
    } catch (e) {
      console.warn(`Invalid URL: ${url}`, e);
    }
    if (url.endsWith(".pdf") && rtt < 500) return 2000;
    return calculateDelay(rtt);
  }
  
  export async function fetchWithRetry(
    url: string,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<{ status: number; rtt: number }> {
    let attempt = 0;
    const start = performance.now();
  
    while (attempt <= maxRetries) {
      try {
        if ('enableCORSFetch' in window) {
          // @ts-expect-error: enableCORSFetch is not typed in TypeScript
          window.enableCORSFetch(true);
        }
  
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': url,
            'Accept': 'application/pdf, */*'
          }
        });
  
        if (response.status !== 403 || attempt === maxRetries) {
          const end = performance.now();
          return { status: response.status, rtt: end - start };
        }
      } catch (e) {
        console.warn(`Fetch error on attempt ${attempt + 1}`, e);
      }
  
      attempt++;
      const backoff = baseDelay * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, backoff));
    }
  
    const end = performance.now();
    return { status: 0, rtt: end - start };
  }
  