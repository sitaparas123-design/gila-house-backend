const { Xendit } = require('xendit-node');
const x = new Xendit({secretKey: 'xnd_development_dummy'});
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(x.Invoice)));
