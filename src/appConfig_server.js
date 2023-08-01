export const appConfig = {
  //apiUrl: process.env.REACT_APP_API_URL || 'http://114.203.87.215:3004/api',
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3004/api',
  region: process.env.REACT_APP_COGNITO_REGION || 'seoul',
  env: process.env.NODE_ENV,
  isDev: true,
  userAdmin: 'admin',
  fileMaxSizeMB: 100, // 100MB
  PAGINATION_COUNT_PER_PAGE: [
    { value: 5, title: '5' },
    { value: 10, title: '10' },
    { value: 20, title: '20' },
    { value: 100, title: '100' },
    { value: 10000, title: '전체'},
  ],
  notificationRefreshTime: 60000,
  startPageURL: '/',
};