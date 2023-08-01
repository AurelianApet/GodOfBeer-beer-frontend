export const appConfig = {
  siteID: 'admin', // admin page
  //apiUrl: process.env.REACT_APP_API_URL || 'http://114.203.87.215:3004/api',
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3004/api',
  googleUrl: process.env.REACT_APP_GOOGLE_URL || 'http://drs.itu.edu/?param=search&s=lpnQej3HNhcq2H8YA1E5w07tM8s&btnG=Search+Desktop',
  region: process.env.REACT_APP_COGNITO_REGION || 'seoul',
  env: process.env.NODE_ENV,
  isDev: false,
  userAdmin: 'admin',
  fileMaxSizeKB: 500, // 500KB
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
