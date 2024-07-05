const { pipeline } = require('node:stream');
const fs = require('node:fs/promises');

// Memory usage not too good for large files
// Not efficient for large files
(async () => {
  const destFile = await fs.open('text-copy.txt', 'w');
  const result = await fs.readFile('text.txt');

  await destFile.write(result);

  console.log(result);
})();

// Memmory usage is good for large files 😁
(async () => {
  const srcFile = await fs.open('text.txt', 'r');
  const destFile = await fs.open('text-copy.txt', 'w');

  let bytesRead = -1;
  while (bytesRead !== 0) {
    const readResult = await srcFile.read();
    bytesRead = readResult.bytesRead;
    if (bytesRead !== 16384) {
      const indexOfNotFilled = readResult.buffer.indexOf(0);
      const newBuffer = Buffer.alloc(indexOfNotFilled);
      readResult.buffer.copy(newBuffer, 0, 0, indexOfNotFilled);
      destFile.write(newBuffer);
    } else {
      destFile.write(readResult.buffer);
    }
  }
})();

// Doing same solution with streams
// memory usage is abit lower, which is good
// This is faster than the one above
// good for production code but it has poor error handling; you can use a pipeline instead
(async () => {
  const srcFile = await fs.open('text.txt', 'r');
  const destFile = await fs.open('text-copy.txt', 'w');

  const readStream = srcFile.createReadStream();
  const writeStream = destFile.createWriteStream();

  readStream.pipe(writeStream);
})();

// With a pipeline its better to be able to handle errors incase it happens
// Incase of an error it calls destroy and rolls back all changes
// use can also use "finished" to handle errors
(async () => {
  const srcFile = await fs.open('text.txt', 'r');
  const destFile = await fs.open('text-copy.txt', 'w');

  const readStream = srcFile.createReadStream();
  const writeStream = destFile.createWriteStream();

  pipeline(readStream, writeStream, (err) => {
    console.log(err);
  });
})();
