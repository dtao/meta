var meta   = require('../meta.js'),
    expect = require('expect.js');

describe(meta, function() {
  describe('Entity', function() {
    var entity;

    beforeEach(function() {
      entity = new meta.Entity();
    });

    it('uses camelCase by default', function() {
      entity.name = 'fooBar';
      expect(entity.singular).to.eql('FooBar');
      expect(entity.plural).to.eql('FooBars');
    });

    it('also supports underscore naming', function() {
      entity.name = 'fooBar';
      expect(entity.underscore).to.eql('foo_bar');
      expect(entity.underscorePlural).to.eql('foo_bars');
    });
  });
});
