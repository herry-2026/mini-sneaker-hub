import { execSync } from 'child_process';
import axios from 'axios';

/**
 * 读取代理配置：优先环境变量，其次 Windows 系统代理
 */
export function getProxyConfig() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (proxyUrl) {
    const url = new URL(proxyUrl);
    return {
      host: url.hostname,
      port: Number(url.port) || 80,
      protocol: url.protocol.replace(':', ''),
    };
  }

  if (process.platform === 'win32') {
    try {
      const script =
        "(Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings')";
      const enable = execSync(
        `powershell -NoProfile -Command "${script}.ProxyEnable"`,
        { encoding: 'utf8' },
      ).trim();
      const server = execSync(
        `powershell -NoProfile -Command "${script}.ProxyServer"`,
        { encoding: 'utf8' },
      ).trim();
      if (enable === '1' && server.includes(':')) {
        const [host, port] = server.split(':');
        return { host, port: Number(port), protocol: 'http' };
      }
    } catch {
      /* 忽略读取失败 */
    }
  }

  return false;
}

export function createHttpClient() {
  const proxy = getProxyConfig();
  return axios.create({
    timeout: 20000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    proxy: proxy || false,
  });
}
