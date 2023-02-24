const uuid = require('uuid');

const generated = uuid.v4();
console.log(generated);
console.log(generated.replace(/-/g, ''));
console.log('\n');
console.log(generated.toUpperCase());
console.log(generated.replace(/-/g, '').toUpperCase());
