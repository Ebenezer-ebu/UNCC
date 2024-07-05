const fs = require('fs/promises');

(async () => {
  // commands
  const CREATE_FILE = 'create a file';
  const DELETE_FILE = 'delete the file';
  const RENAME_FILE = 'rename the file';
  const ADD_TO_FILE = 'add to the file';

  const createFile = async (path) => {
    let existingFileHandle;
    try {
      // we want to check whether or not we already have that file
      existingFileHandle = await fs.open(path, 'r');
      existingFileHandle.close();
      // we already have that file...
      return console.log(`The file ${path} already exists`);
    } catch (e) {
      // we don't have the file, now we should create it
      const newFileHandle = await fs.open(path, 'w');
      console.log('A new file was successfully created.');
      newFileHandle.close();
    }
  };

  const deleteFile = async (path) => {
    try {
      await fs.unlink(path);
      console.log('file deleted successfully');
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.log('File does not exists.');
      } else {
        console.log('An error happened');
      }
    }
  };

  const renameFile = async (oldPath, newPath) => {
    console.log('Renaming file ' + oldPath + ' to ' + newPath);
    try {
      await fs.rename(oldPath, newPath);
      console.log('file renamed successfully');
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.log('File does not exists to rename, or destination does not exist');
      } else {
        console.log('An error happened');
      }
    }
  };

  let addedContent;

  const addToFile = async (path, content) => {
    if (addedContent === content) return;
    try {
      // this writes and appends to original content
      const fileHandle = await fs.open(path, 'a');
      // this writes and replaces
      // const fileHandle = await fs.open(path, 'w');

      fileHandle.write(content);
      addedContent = content;
      console.log('file content added successfully');
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.log('File does not exists to write to');
      } else {
        console.log('An error happened');
      }
    }
  };

  const commandFileHandler = await fs.open('./command.txt', 'r');
  // This watches for changes in the file or directory specified
  const watcher = fs.watch('./command.txt');

  commandFileHandler.on('change', async () => {
    // get size of file
    const size = (await commandFileHandler.stat()).size;
    // allocate our buffer with the size of the file
    const buff = Buffer.alloc(size);
    // the location at which we want to start filling our buffer
    const offset = 0;
    // how many bytes we want to read
    const length = buff.byteLength;
    // the position that we want to start reading the file from
    const position = 0;

    // we always want to read the content of the file Ifrom beginning all the way to the end)
    await commandFileHandler.read(buff, offset, length, position);
    const command = buff.toString('utf-8');

    // create a file:
    // create a file <path>
    if (command.includes(CREATE_FILE)) {
      const filePath = command.substring(CREATE_FILE.length + 1);
      createFile(filePath);
    }

    // delate a file:
    // delete the file <path>
    if (command.includes(DELETE_FILE)) {
      const filePath = command.substring(DELETE_FILE.length + 1);
      deleteFile(filePath);
    }

    // rename file:
    // rename the file <path> to <newpath>
    if (command.includes(RENAME_FILE)) {
      const _idx = command.indexOf(' to ');
      const oldFilePath = command.substring(RENAME_FILE.length + 1, _idx);
      const newFilePath = command.substring(_idx + 4);

      renameFile(oldFilePath, newFilePath);
    }

    // add to file:
    // add to the file <path> this content: <content>
    if (command.includes(ADD_TO_FILE)) {
      const _idx = command.indexOf(' this content: ');
      const filePath = command.substring(ADD_TO_FILE.length + 1, _idx);
      const content = command.substring(_idx + 15);

      addToFile(filePath, content);
    }
  });

  for await (const event of watcher) {
    if (event.eventType === 'change') {
      commandFileHandler.emit('change');
    }
  }
})();
