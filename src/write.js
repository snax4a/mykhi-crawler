const fs = require('fs');

const write = (dir, data) => new Promise((resolve, reject) => {
  fs.writeFile(
    dir,
    data,
    { flag: 'w' },
    (err) => {
      if (err) {
        reject(err);
      }

      resolve();
    }
  )
});

module.exports = { write };
