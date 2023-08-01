import createNumberMask from 'text-mask-addons/dist/createNumberMask';

export const currencyMask = createNumberMask({
  prefix: '$ ',
  allowDecimal: true,
  integerLimit: 10,
});

export const confirmAmountOfSaleMask = createNumberMask({
  prefix: '$ ',
  allowDecimal: true,
  integerLimit: 5,
  maxValue: 100,
  minValue: 0,
});

export const numberMask = createNumberMask({
  prefix: '',
  thousandsSeparatorSymbol: '',
  allowLeadingZeroes: true,
});

export function unmask(val) {
  return val.replace(/[$, ]+/g, '');
}

export function numberUnmask(val) {
  if ( !val ) return 0;
  // return Number(val.match(/\d+/g).join(''));
  return Number(val.replace(/[$, ]+/g, ''));
}

export function floatUnmask(val) {
  const numbers = val.match(/[\d.]+/g);
  return numbers ? numbers.join('') : 0;
}

export function removeSpace(str) {
  if(!str) return '';
  return str.replace(/\s+/g, '');
}

export function removeUnderline(str) {
  if(!str) return '';
  return str.replace(/_+/g, '');
}

export function unmaskCurrency(val) {
  if(!val) return '';
  return val.replace(/[$, ]+/g, '');
}

export function maskNumber(val) {
  if (!val) return '0';
  const originString = `${val}`;
  const stringArray = originString.split( '.' );
  if ( stringArray.length > 1 ) {
    return originString;
  };
  const valString = stringArray[0];
  let newString = '';
  for ( let i = 0; i < valString.length; i++ ) {
    const indexLastOf = valString.length - i - 1;
    newString = ( ( i !== 0 && i % 3 === 0 )? valString[indexLastOf] + ',' : valString[indexLastOf] ) + newString;
  }
  return newString;
}
