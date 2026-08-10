const { Xendit } = require('xendit-node');
const x = new Xendit({secretKey: 'xnd_development_dummy'});
console.log(Object.keys(x.Invoice));
