import tempaltes from "./_compiled/templates.mjs";
import locales from "./_compiled/locales.mjs";
const lang = locales();

console.log(lang.BUTTON_OK);
console.log(tempaltes.str('styles'));
