import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';
import {
  calculateDelay,
  smartDelay,
  fetchWithRetry
} from '../linkChecker';

// ------------------------
// テスト共通セットアップ
// ------------------------
const fetchMock = createFetchMock(vi);

beforeEach(() => {
  // fake timers => performance.now() も同期して進む
  vi.useFakeTimers();

  // fetch mock を初期化
  fetchMock.enableMocks();
  fetchMock.resetMocks();

  // window.enableCORSFetch のスタブ
  vi.stubGlobal('window', { enableCORSFetch: vi.fn() });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ------------------------
// calculateDelay
// ------------------------
describe('calculateDelay', () => {
  it.each([
    [  999,  300 ],
    [ 1000,  800 ],
    [ 2999,  800 ],
    [ 3000, 1500 ],
    [ 5999, 1500 ],
    [ 6000, 3000 ]
  ])('RTT %d ms ⇒ %d ms', (rtt, expected) => {
    expect(calculateDelay(rtt)).toBe(expected);
  });
});

// ------------------------
// smartDelay
// ------------------------
describe('smartDelay', () => {
  it('researchgate.net は常に 4000 ms', () => {
    expect(smartDelay('https://researchgate.net/abc', 50)).toBe(4000);
  });

  it('PDF かつ RTT<500 ms は 2000 ms', () => {
    expect(smartDelay('https://example.com/file.pdf', 400)).toBe(2000);
  });

  it('その他は calculateDelay の結果', () => {
    expect(smartDelay('https://example.com', 2800)).toBe(800);
  });
});

// ------------------------
// fetchWithRetry
// ------------------------
describe('fetchWithRetry', () => {
  it('1 回で成功した場合はリトライしない', async () => {
    fetchMock.mockResponseOnce('', { status: 200 });

    // RTT を 123ms 進めてから実行
    const p = fetchWithRetry('https://ok.example');
    vi.advanceTimersByTime(123);
    const res = await p;

    expect(res).toEqual({ status: 200, rtt: 123 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('403 → 403 → 200 で成功するケース', async () => {
    fetchMock
      .mockResponses(
        ['', { status: 403 }],
        ['', { status: 403 }],
        ['', { status: 200 }]
      );

    const promise = fetchWithRetry('https://flip.example');
    // バックオフ: 2s → 4s
    await vi.advanceTimersByTimeAsync(2_000);
    await vi.advanceTimersByTimeAsync(4_000);

    const res = await promise;
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('全リトライ失敗 (403×4) で終了', async () => {
    fetchMock.mockResponses(
      ['', { status: 403 }],
      ['', { status: 403 }],
      ['', { status: 403 }],
      ['', { status: 403 }]
    );

    const p = fetchWithRetry('https://fail.example', 3);
    await vi.runAllTimersAsync();

    const res = await p;
    expect(res.status).toBe(403);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('fetch が常に throw → status 0', async () => {
    fetchMock.mockReject(new Error('network down'));

    const p = fetchWithRetry('https://throw.example', 2);
    await vi.runAllTimersAsync();

    const res = await p;
    expect(res.status).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});