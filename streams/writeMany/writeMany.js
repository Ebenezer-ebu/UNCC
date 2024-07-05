const fs = require('node:fs/promises');

// Execution time: 8secs to run
// CPU usage: 100% (one core)
// Memory usage: 50MB
// (async () => {
//   console.time('time');
//   const fileHandle = await fs.open('./text.txt', 'w');
//   for (let i = 0; i < 1000000; i++) {
//     await fileHandle.write(` ${i} `);
//   }
//   console.timeEnd('time');
//   fileHandle.close();
// })();

// const fs = require('node:fs');

// Execution time: 1.6sec - 0.2ms to run
// CPU usage: 100% (one core)
// Memory usage: 50MB - 30MB
// (async () => {
//   console.time('time');
//   fs.open('./text.txt', 'w', (err, fd) => {
//     for (let i = 0; i < 1000000; i++) {
//       const buff = Buffer.from(` ${i} `, 'utf-8'); // you can use the buffer directly instead of the string directly
//       fs.writeSync(fd, ` ${i} `);
//       //   fs.writeSync(fd, buff); Oprions 2 !!!!!
//     }
//   });
//   console.timeEnd('time');
// })();

// Execution time: 1sec - 0.2ms to run
// CPU usage: 100% (one core)
// Memory usage: 500MB which is a huge amount of memory 😱
// (async () => {
//   console.time('time');
//   fs.open('./text.txt', 'w', (err, fd) => {
//     for (let i = 0; i < 1000000; i++) {
//       fs.write(fd, ` ${i} `, () => {});
//     }
//   });
//   console.timeEnd('time');
// })();

// With streams Example
// DON'T DO IT THIS WAY 👎🏻
// Execution time: about 278.045ms to run which is fast
// CPU usage: 100% (one core)
// Memory usage: 200MB which is a huge amount of memory 😱
// (async () => {
//   console.time('time');
//   const fileHandle = await fs.open('./text.txt', 'w');

//   const stream = fileHandle.createWriteStream();
//   for (let i = 0; i < 1000000; i++) {
//     const buff = Buffer.from(` ${i} `, 'utf-8');
//     stream.write(buff);
//   }
//   console.timeEnd('time');
//   fileHandle.close();
// })();

// With streams Example
// MORE EFFICIENT 👍🏻
// Execution time: about 288.81ms to run which is fast
// CPU usage: 100% (one core)
// Memory usage: 15MB which is a huge amount of memory 😁
(async () => {
  console.time('time');
  const fileHandle = await fs.open('text.txt', 'w');

  const stream = fileHandle.createWriteStream(); // STREAMS ARE APPROXIMATELY 16KB IN SIZE ==> 16384
  // This gives the stream size that can be taken
  console.log(stream.writableHighWaterMark);
  // 8 bits = 1 bytes
  // 1000 bytes = 1 kilobyte
  // 1000 kilobytes = i megabyte
  let i = 0;
  const numberOfWrites = 1000000;
  const writeMany = () => {
    while (i < numberOfWrites) {
      const buff = Buffer.from(` ${i} `, 'utf-8');

      // this is our last write
      if (i === numberOfWrites - 1) {
        return stream.end();
      }

      // if stream.write returns false stop the loop
      if (!stream.write(buff)) break;
      i++;
    }
  };

  writeMany();

  // NOTE: internal buffer 16384 bytes ==> stream.writableHighWaterMark
  // resume the loop once our stream's internal buffer emptied
  stream.on('drain', () => {
    writeMany();
  });

  stream.on('finish', () => {
    console.timeEnd('time');
    fileHandle.close();
  });
})();
