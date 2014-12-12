var fs   = require('fs'),
    yaml = require('js-yaml');

var meta = {};

/**
 * Base prototype for shared logic between models, attributes, etc.
 */
meta.Entity = function Entity() {
};

meta.Entity.create = function create(constructor) {
  constructor.prototype = Object.create(meta.Entity.prototype, {});
  constructor.prototype.constructor = constructor;
  return constructor;
};

['string', 'number', 'boolean'].forEach(function(type) {
  var methodName = 'get' + capitalize(type);

  meta.Entity.prototype[methodName] = function(data, key, defaultValue) {
    var value = data[key];
    if (typeof value !== type) {
      if (typeof defaultValue !== type) {
        var errMsg = 'Expected a ' + type + ' for ' + this.constructor.name + '#' + key;
        if (data.name) {
          errMsg += ' ("' + data.name + '")';
        }
        throw Error(errMsg);
      }
      value = defaultValue;
    }
    return value;
  };
});

/**
 * Represents a software application consisting of models and views.
 */
meta.Application = meta.Entity.create(function Application(data) {
  data = data || {};

  this.name = this.getString(data, 'name');
  this.models = (data.models || []).map(meta.Model);
});

/**
 * Represents a "model" (domain object) in an application.
 */
meta.Model = meta.Entity.create(function Model(data) {
  if (!(this instanceof meta.Model)) {
    return new meta.Model(data);
  }

  data = data || {};
  this.name = this.getString(data, 'name');
  this.attributes = (data.attributes || []).map(meta.Attribute);
});

/**
 * Represents an attribute or property of a model.
 */
meta.Attribute = meta.Entity.create(function Attribute(data) {
  if (!(this instanceof meta.Attribute)) {
    return new meta.Attribute(data);
  }

  data = meta.Attribute.normalizeData(data);
  this.name = this.getString(data, 'name');
  this.type = this.getString(data, 'type', 'string');
  this.required = this.getBoolean(data, 'required', false);
});

/**
 * Converts the short form to the long form.
 *
 * @examples
 * meta.Attribute.normalizeData('foo'); // => {name: 'foo'}
 * meta.Attribute.normalizeData(['foo', {type: 'string'}]); // => {name: 'foo', type: 'string'}
 */
meta.Attribute.normalizeData = function normalizeData(data) {
  data = data || {};
  if (typeof data === 'string') {
    return { name: data };
  }
  if (data instanceof Array) {
    data = extend({ name: data[0] }, data[1]);
  }
  return data;
};

/**
 * Parses the given YAML to a {@link meta.Application} object.
 */
meta.parse = function parse(content) {
  var data = yaml.safeLoad(content);
  return new meta.Application(data);
};

/**
 * Loads the given YAML file.
 */
meta.loadFile = function loadFile(file) {
  return meta.parse(fs.readFileSync(file, 'utf8'));
};

/**
 * @private
 * @example
 * extend({foo: 1}, {bar: 2});             // => {foo: 1, bar: 2}
 * extend({foo: 1}, {foo: '!', bar: '?'}); // => {foo: '!', bar: '?'}
 */
function extend(object, properties) {
  for (var prop in properties) {
    object[prop] = properties[prop];
  }
  return object;
}

/**
 * @private
 * @example
 * capitalize('foo'); // => 'Foo'
 * capitalize('');    // => ''
 */
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.substring(1);
}

module.exports = meta;
