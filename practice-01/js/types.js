"use strict";

// 1. "8" + 2
// Ожидание: строка "82" (число превращается в строку и приклеивается)
console.log('1. "8" + 2 =', "8" + 2);
console.log('   Тип:', typeof ("8" + 2));

// 2. "8" - 2
// Ожидание: число 6 (строка превращается в число)
console.log('2. "8" - 2 =', "8" - 2);
console.log('   Тип:', typeof ("8" - 2));

// 3. Number("8") + 2
// Ожидание: число 10 (явное преобразование строки в число)
console.log('3. Number("8") + 2 =', Number("8") + 2);
console.log('   Тип:', typeof (Number("8") + 2));

// 4. "12" > "3"
// Ожидание: false (строки сравниваются посимвольно, "1" меньше "3")
console.log('4. "12" > "3" =', "12" > "3");
console.log('   Тип:', typeof ("12" > "3"));

// 5. 12 === "12"
// Ожидание: false (строгое равенство не преобразует типы)
console.log('5. 12 === "12" =', 12 === "12");
console.log('   Тип:', typeof (12 === "12"));

// 6. Number("")
// Ожидание: число 0 (пустая строка преобразуется в 0)
console.log('6. Number("") =', Number(""));
console.log('   Тип:', typeof Number(""));

// 7. Number("text")
// Ожидание: NaN (не число, так как "text" нельзя преобразовать)
console.log('7. Number("text") =', Number("text"));
console.log('   Тип:', typeof Number("text"));

// 8. Boolean("false")
// Ожидание: true (непустая строка всегда true)
console.log('8. Boolean("false") =', Boolean("false"));
console.log('   Тип:', typeof Boolean("false"));

// 9. typeof null
// Ожидание: "object" (особенность языка)
console.log('9. typeof null =', typeof null);
console.log('   Тип:', typeof (typeof null));

// 10. typeof NaN
// Ожидание: "number" (NaN - это числовой тип)
console.log('10. typeof NaN =', typeof NaN);
console.log('    Тип:', typeof (typeof NaN));