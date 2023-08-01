import axios from 'axios';
import { appConfig } from '../../appConfig';
import { pushNotification, NOTIFICATION_TYPE_ERROR } from './notification';
import LANG from '../../language';

const fileNameDelimiter = '***';

export const downloadFile = (fid, isPublic) => {
  const token = localStorage.getItem('token');
  // axios.defaults.baseURL = appConfig.apiUrl;
  // axios.defaults.headers.common.Authorization = token || '';
  axios({
    method:'get',
    url:appConfig.apiUrl + '/files/download/' + fid + (isPublic ? '?isPublic=true' : ''),
    responseType:'blob',
    headers: {
      Authorization: token,
    },
  })
  .then(function (response) {
    let fileName = 'unknown', mime = 'application/stream';
    const contentType = response.headers['content-type'];
    if(contentType && contentType.indexOf(fileNameDelimiter) >= 0) {
      let tmpArr = contentType.split(fileNameDelimiter);
      fileName = decodeURIComponent(tmpArr[1]);
      mime = tmpArr[0];
    }
    if (response.data) {
      let blob = new Blob([response.data], { type: mime });
      let csvUrl = URL.createObjectURL(blob);
      
      if (navigator.userAgent.search(/Firefox/i) >= 0) {
        window.open(csvUrl);
      } else {
        let link = document.createElement('a')
        link.setAttribute('href', csvUrl);
        link.setAttribute('download', fileName);
        link.click();
      }
    }
  })
  .catch(function (error) {
    pushNotification(NOTIFICATION_TYPE_ERROR, LANG('LIBRARY_FILEUPLOAD_DOWNLOAD_ERROR'));
  });
}