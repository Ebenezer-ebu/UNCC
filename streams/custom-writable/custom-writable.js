// Our own writable stream
const { Writable } = require('node:stream');
const fs = require('node:fs');

class FileWriteStream extends Writable {
  constructor({ highWaterMark, fileName }) {
    super({ highWaterMark });

    this.fileName = fileName;
    this.fd = null;
    this.chunks = [];
    this.chunksSize = 0;
    this.writesCount = 0;
  }

  // this will run after the custructor and will put off calling the other methods
  // until we call the callback function
  _construct(callback) {
    // fd means file discriptor
    fs.open(this.fileName, 'w', (err, fd) => {
      if (err) {
        // so if we call the callback with an argument, it means that we hava an error
        // and we should not proceed
        callback(err);
      } else {
        this.fd = fd;
        // no arguments means it was successful
        callback();
      }
    });
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    this.chunksSize += chunk.length;

    if (this.chunksSize > this.writableHighWaterMark) {
      fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
        if (err) {
          return callback(err);
        } else {
          this.chunks = [];
          this.chunksSize = 0;
          ++this.writesCount;
          callback();
        }
      });
    } else {
      // when we're done, we should call the callback function
      callback();
    }
  }

  _final(callback) {
    fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
      if (err) {
        return callback(err);
      } else {
        this.chunks = [];
        callback();
      }
    });
  }

  _destroy(error, callback) {
    console.log('Number of writes:', this.writesCount);
    if (this.fd) {
      fs.close(this.fd, (err) => {
        callback(err || error);
      });
    } else {
      callback(error);
    }
  }
}

// const stream = new FileWriteStream({ highWaterMark: 1800, fileName: 'text.txt' });
// stream.write(Buffer.from('This is some string.'));
// stream.end(Buffer.from('Our last write'));

// stream.on('finish', () => {
//   console.log('stream was finished');
// });

// With streams Example
// MORE EFFICIENT 👍🏻
// Execution time: about 288.81ms to run which is fast
// CPU usage: 100% (one core)
// Memory usage: 15MB which is a huge amount of memory 😁
(async () => {
  console.time('time');
  const stream = new FileWriteStream({ fileName: 'text.txt' }); // STREAMS ARE APPROXIMATELY 16KB IN SIZE ==> 16384
  // This gives the stream size that can be taken
  console.log(stream.writableHighWaterMark);

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

  let d = 0;
  // NOTE: internal buffer 16384 bytes ==> stream.writableHighWaterMark
  // resume the loop once our stream's internal buffer emptied
  stream.on('drain', () => {
    ++d;
    writeMany();
  });

  stream.on('finish', () => {
    console.log('numbers of drain: ' + d);
    console.timeEnd('time');
  });
})();
