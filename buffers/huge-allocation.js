const { Buffer } = require('buffer');

const b = Buffer.alloc(0.5e9); // 500,000,000 bytes (500MB)

setInterval(() => {
//   for (let i = 0; i < b.length; i++) {
//     // b.length is the size of the buffer in bytes
//     b[i] = 0x22;
//   }
  b.fill(0x22) // same as above, but more efficient
}, 5000);
