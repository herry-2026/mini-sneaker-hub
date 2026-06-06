import crypto from 'crypto';

const SALT = '048a9c4943398714b356a696503d2d36';

function buildSignString(params) {
  if (!params) return '';
  return Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      let value = params[key];
      if (value === undefined) return acc;
      if (Number.isNaN(value)) value = '';
      if (Array.isArray(value)) {
        if (value.length === 0) return `${acc}${key}`;
        const sorted = value
          .slice()
          .sort()
          .map((item) =>
            typeof item === 'object' && item !== null ? JSON.stringify(item) : item,
          )
          .join(',');
        return `${acc}${key}${sorted}`;
      }
      if (typeof value === 'object' && value !== null) {
        return acc + key + JSON.stringify(value);
      }
      return acc + key + String(value);
    }, '');
}

/** 得物 H5 接口 sign 参数（与官网 webpack 逻辑一致） */
export function createDewuSign(params) {
  return crypto.createHash('md5').update(buildSignString(params) + SALT).digest('hex');
}

export function withDewuSign(params) {
  return { sign: createDewuSign(params), ...params };
}
