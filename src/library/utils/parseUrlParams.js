export function parseUrlParams(str) {
  if (!str) 
    return {};
  const trimmedStr = str[0] === '?' ? str.slice(1) : '';

  const params = {};
  if (trimmedStr !== '') {
    trimmedStr.split('&').forEach((item) => {
      const arr = item.split('=');
      params[arr[0]] = arr[1];
    });
  }

  return params;
}