const { Buffer } = require('buffer');

const buffer = Buffer.alloc(10000); // this is slower

console.log(Buffer.poolSize >>> 1);
const unsafeBuffer = Buffer.allocUnsafe(10000); // this is faster but unsafe because this is possibly going to have some other data that might be sensitive

const buff = Buffer.allocUnsafeSlow(2);

Buffer.from(); // This uses allocUnsafe under the hood
Buffer.concat(); // This uses allocUnsafe under the hood

for (let i = 0; i < unsafeBuffer.length; i++) {
  if (unsafeBuffer[i] !== 0) {
    console.log(`Element at position ${i} has value: ${unsafeBuffer[i].toString(2)}`); // some data will most likely be here
  }
}

for (let i = 0; i < buffer.length; i++) {
  if (buffer[i] !== 0) {
    console.log(`Element at position ${i} has value: ${buffer[i].toString(2)}`); // Nothing will be logged here
  }
}
