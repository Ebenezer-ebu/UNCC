const fs = require('node:fs/promises');

(async () => {
  console.time('readbig');
  const fileHandleRead = await fs.open('src.txt', 'r');
  const fileHandleWrite = await fs.open('dest.txt', 'w');

  // the highwatermark is 64kb
  const streamRead = fileHandleRead.createReadStream({ highWaterMark: 64 * 1024 });
  const streamWrite = fileHandleWrite.createWriteStream();

  let split = '';
  streamRead.on('data', (chunk) => {
    const numbers = chunk.toString('utf-8').split('  ');

    if (Number(numbers[0]) !== Number(numbers[1] - 1)) {
      if (split) {
        numbers[0] = split.trim() + numbers[0].trim();
      }
    }

    if (Number(numbers[numbers.length - 2]) + 1 !== Number(numbers[numbers.length - 1])) {
      split = numbers.pop();
    }

    console.log(numbers);
    numbers.forEach((number) => {
      let n = Number(number);
      if (n % 2 === 0) {
        if (!streamWrite.write(' ' + n + ' ')) {
          // this pauses the read data event
          streamRead.pause();
        }
      }
    });
  });
  streamWrite.on('drain', () => {
    // this resumes the read operation as soon as the internal buffer is drained
    streamRead.resume();
  });

  streamRead.on('end', () => {
    console.log('done reading');
    console.timeEnd('readbig');
  });
})();
