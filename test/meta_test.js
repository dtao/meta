var meta = require('../meta.js');

describe(meta, function() {
  it('works', function() {
    var app = meta.loadFile('example/vanilla.yml');
    console.log(JSON.stringify(app, null, 2));
  });
});
