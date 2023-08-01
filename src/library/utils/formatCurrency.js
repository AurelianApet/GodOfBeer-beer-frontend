export function formatCurrency(x, decimalCount) {
  return Number.parseFloat(x).toFixed(decimalCount).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}
