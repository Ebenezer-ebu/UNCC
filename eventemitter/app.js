const EventEmitter = require('events');

class Emitter extends EventEmitter {}

const myEmitter = new Emitter();

myEmitter.on('foo', () => {
  console.log('An event occured');
});

myEmitter.on('foo', () => {
  console.log('An event occured 2');
});

myEmitter.on('foo', (x) => {
  console.log('An event with a parameter occured');
  console.log(x);
});

// This gets emitted once
myEmitter.once('bar', () => {
  console.log('An event occured bar');
});

myEmitter.on('bar', () => {
  console.log('An event occured bar');
});

myEmitter.emit('foo');
myEmitter.emit('foo', 'some text');

myEmitter.emit('bar');
myEmitter.emit('bar');
myEmitter.emit('bar');

