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

/**
 * Gets a string property, or a default value. If no default is specified,
 * throws an informative error.
 */
meta.Entity.prototype.getString = function(data, key, defaultValue) {
  var value = data[key];
  if (typeof value !== 'string') {
    if (typeof defaultValue !== 'string') {
      var errMsg = 'Expected a string for ' + this.constructor.name + '#' + key;
      if (data.name) {
        errMsg += ' ("' + data.name + '")';
      }
      throw Error(errMsg);
    }
    value = defaultValue;
  }
  return value;
};

/**
 * Gets a boolean property, or a default value. If no default is specified,
 * throws an informative error.
 */
meta.Entity.prototype.getBoolean = function(data, key, defaultValue) {
  var value = data[key];
  if (typeof value !== 'boolean') {
    if (typeof defaultValue !== 'boolean') {
      var errMsg = 'Expected a boolean for ' + this.constructor.name + '#' + key;
      if (data.name) {
        errMsg += ' ("' + data.name + '")';
      }
      throw Error(errMsg);
    }
    value = defaultValue;
  }
  return value;
};

/**
 * Represents a software application consisting of models and views.
 */
meta.Application = meta.Entity.create(function Application(data) {
  data = data || {};

  this.name = this.getString(data, 'name');
  this.models = map(data.models || [], meta.Model);
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
  this.attributes = map(data.attributes || [], meta.Attribute);
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

function map(collection, fn) {
  var result = new Array(collection.length);
  for (var i = 0; i < collection.length; ++i) {
    result[i] = fn(collection[i]);
  }
  return result;
}

function extend(object, properties) {
  for (var prop in properties) {
    object[prop] = properties[prop];
  }
  return object;
}

module.exports = meta;
