export function validateEmail(email) {
  // eslint-disable-next-line
  return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email));
}

export function generateRandomString(len){
  let result = '';
  let letters = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
  let lettersLength = letters.length;

  for(let i = 0 ; i < len ; i++)
  {
    result += letters[Math.round(Math.random() * lettersLength) % lettersLength];
  }

  return result;
}
export function generateSoftKey() {
  return generateRandomString(4)+"-"+generateRandomString(4)+"-"+generateRandomString(4);
}
