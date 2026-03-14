const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
const ECOOKBOOK_PATH = 'Documents/eCookbook/_data/shopping-list.json';

export class GraphClient {
  constructor(private getAccessToken: () => Promise<string>) {}

  private async request(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAccessToken();
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      throw new GraphError('Unauthorized — token may be expired', 401);
    }
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new GraphError(`Rate limited. Retry after ${retryAfter}s`, 429);
    }

    return response;
  }

  /** Get file metadata (eTag, lastModified) */
  async getFileMetadata(): Promise<{ eTag: string; lastModified: string } | null> {
    const url = `${GRAPH_BASE}/me/drive/root:/${ECOOKBOOK_PATH}`;
    const response = await this.request(url);

    if (response.status === 404) return null;
    if (!response.ok) throw new GraphError('Failed to get file metadata', response.status);

    const data = await response.json();
    return {
      eTag: data.eTag,
      lastModified: data.lastModifiedDateTime,
    };
  }

  /** Download shopping list contents */
  async downloadShoppingList(): Promise<{ items: unknown[]; eTag: string } | null> {
    // First get metadata for eTag
    const meta = await this.getFileMetadata();
    if (!meta) return null;

    const url = `${GRAPH_BASE}/me/drive/root:/${ECOOKBOOK_PATH}:/content`;
    const response = await this.request(url);

    if (response.status === 404) return null;
    if (!response.ok) throw new GraphError('Failed to download shopping list', response.status);

    const text = await response.text();
    const items = JSON.parse(text);
    return { items: Array.isArray(items) ? items : [], eTag: meta.eTag };
  }

  /** Upload shopping list, using eTag for conflict detection */
  async uploadShoppingList(items: unknown[], eTag: string | null): Promise<string> {
    const url = `${GRAPH_BASE}/me/drive/root:/${ECOOKBOOK_PATH}:/content`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (eTag) {
      headers['If-Match'] = eTag;
    }

    const response = await this.request(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(items, null, 2),
    });

    if (response.status === 412 || response.status === 409) {
      throw new GraphError('Conflict — file was modified remotely', response.status);
    }
    if (!response.ok) {
      throw new GraphError('Failed to upload shopping list', response.status);
    }

    const data = await response.json();
    return data.eTag;
  }

  /** Get current user profile */
  async getMe(): Promise<{ displayName: string; mail: string }> {
    const url = `${GRAPH_BASE}/me`;
    const response = await this.request(url);
    if (!response.ok) throw new GraphError('Failed to get user profile', response.status);
    return response.json();
  }
}

export class GraphError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'GraphError';
  }
}
