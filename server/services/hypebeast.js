import { fetchWithRssFallback } from '../utils/rssFetch.js';

const RSS_URL = 'https://hypebeast.com/feed';
const WP_API_URL =
  'https://hypebeast.com/wp-json/wp/v2/posts?per_page=10&_fields=title,link';

export async function fetchHypebeast() {
  return fetchWithRssFallback({
    rssUrl: RSS_URL,
    wpApiUrl: WP_API_URL,
    label: 'hypebeast',
  });
}
