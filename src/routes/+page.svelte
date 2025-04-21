<script lang="ts">
    import { open } from '@tauri-apps/plugin-dialog';
    import { readTextFile } from '@tauri-apps/plugin-fs';
    import { fetchWithRetry, smartDelay } from '$lib/utils/linkChecker';
  
    let urls: string[] = [];
    let results: { url: string; status: number; rtt: number }[] = [];
    let loading = false;
    let currentUrl = '';
    let progress = 0;
  
    async function selectUrlsJson(): Promise<void> {
      try {
        const filePath = await open({
          title: 'urls.json を選択',
          filters: [{ name: 'JSON Files', extensions: ['json'] }]
        });
  
        if (!filePath || typeof filePath !== 'string') {
          alert('ファイルが選択されませんでした');
          return;
        }
  
        const content = await readTextFile(filePath);
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed) || !parsed.every(x => typeof x === 'string')) {
          alert('ファイルの形式が正しくありません（文字列配列が必要です）');
          return;
        }
  
        urls = parsed;
        await startLinkCheck();
      } catch (e) {
        console.error('ファイル読み込みエラー:', e);
        alert('ファイル読み込みに失敗しました');
      }
    }
  
    async function startLinkCheck() {
      loading = true;
      results = [];
  
      for (let i = 0; i < urls.length; i++) {
        currentUrl = urls[i];
        const result = await fetchWithRetry(currentUrl);
        results.push({ url: currentUrl, status: result.status, rtt: result.rtt });
        progress = Math.round(((i + 1) / urls.length) * 100);
        const delay = smartDelay(currentUrl, result.rtt);
        await new Promise((r) => setTimeout(r, delay));
      }
  
      loading = false;
    }
  
    function getStatusClass(status: number): string {
      if (status >= 200 && status < 300) return 'has-background-success-light';
      if (status >= 300 && status < 400) return 'has-background-warning-light';
      if (status >= 400) return 'has-background-danger-light';
      return '';
    }
  </script>
  
  <svelte:head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css" />
  </svelte:head>
  
  <div class="section has-text-centered">
    <button class="button is-primary is-large" on:click={selectUrlsJson}>
      urls.json を選択してリンクチェックを開始
    </button>
  </div>
  
  {#if loading}
    <div class="section">
      <div class="container has-text-centered">
        <p class="mb-4">リンクをチェックしています...</p>
        <progress class="progress is-primary" value={progress} max="100">{progress}%</progress>
        <p class="mt-4">現在確認中のURL: <code>{currentUrl}</code></p>
      </div>
    </div>
  {:else if results.length > 0}
    <div class="section">
      <div class="container">
        <table class="table is-fullwidth is-hoverable is-striped">
          <thead>
            <tr>
              <th>行番号</th>
              <th>URL</th>
              <th>ステータス</th>
              <th>RTT (ms)</th>
            </tr>
          </thead>
          <tbody>
            {#each results as result, i}
              <tr class={getStatusClass(result.status)}>
                <td>{i + 1}</td>
                <td><a href={result.url} target="_blank">{result.url}</a></td>
                <td>{result.status === 0 ? 'エラー' : result.status}</td>
                <td>{Math.round(result.rtt)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}