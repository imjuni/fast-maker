const uuid = require('uuid');

const uuidGenerated = uuid.v4();
console.log(uuidGenerated.toUpperCase());
console.log(uuidGenerated.replace(/-/g, '').toUpperCase());
