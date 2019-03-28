const zlib = require('zlib');
const fs = require('fs');
const stream = require('stream');
const Int64BE = require("int64-buffer").Int64BE;
const Uint64BE = require("int64-buffer").Uint64BE;

const struct = require('python-struct');

var tags = [];

class Tag {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    tags[id] = this;
  }
  static from_stream(stream) {
    return tags[struct.unpack('>b', stream.read(1))[0]];
  }
  parse(stream) {
    return { type:this, name:TAG_STRING.parse_impl(stream), data:this.parse_impl(stream) };
  }
  parse_length(length_type, stream) {
    return struct.unpack('>' + length_type.format, stream.read(length_type.size))[0];
  }
}

class FixedTag extends  Tag {
  constructor(name, id, size, format, callback = null) {
    super(name, id);
    this.size = size;
    this.format = format;
    this.callback = callback;
  }
  parse_impl(stream) {
    var t = struct.unpack('>' + this.format, stream.read(this.size))[0];
    return this.callback ? this.callback(t) : t;
  }
}

class VariableTag extends Tag {
  constructor(name, id, length_tag, encoding = null) {
    super(name, id);
    this.length_tag = length_tag;
    this.encoding = encoding;
  }
  parse_impl(stream) {
    var data = stream.read(this.parse_length(this.length_tag, stream));
    return this.encoding ? this.encoding(data) : data;
  }
}

class EndTag extends Tag { }

class ListTag extends Tag {
  parse_impl(stream) {
    var  e_type = Tag.from_stream(stream), data = [];
    for (var i = 0, l = this.parse_length(TAG_INT, stream); i < l; ++i)
      data.push(e_type.parse_impl(stream));
    return data;
  }
}

class CompoundTag extends Tag {
  parse_impl(stream) {
    var data = [], type;
    while (!((type = Tag.from_stream(stream)) instanceof EndTag))
      data.push(type.parse(stream));
    return data;
  }
}

class IntArrayTag extends Tag {
  parse_impl(stream) {
    var data = [];
    for (var i = 0, l = this.parse_length(TAG_INT, stream); i  < l; ++i)
      data.push(TAG_INT.parse_impl(stream));
  }
}

function convertLong(json) {
  return (json.unsigned ? new Uint64BE(json.high, json.low) : new Int64BE(json.high, json.low)).toString(10);
}

const TAG_END = new EndTag('end', 0),
      TAG_BYTE = new FixedTag('byte', 1, 1, 'b'),
      TAG_SHORT = new FixedTag('byte', 2, 2, 'h'),
      TAG_INT = new FixedTag('int', 3, 4, 'i'),
      TAG_LONG = new FixedTag('long', 4, 8, 'q', convertLong),
      TAG_FLOAT = new FixedTag('float', 5, 4, 'f'),
      TAG_DOUBLE = new FixedTag('double', 6, 8, 'd'),
      TAG_BYTE_ARRAY = new VariableTag('byte_array', 7, TAG_INT),
      TAG_STRING = new VariableTag('string', 8, TAG_SHORT, (d) => d ? d.toString('utf8') : ''),
      TAG_LIST = new ListTag('list', 9),
      TAG_COMPOUND = new CompoundTag('compound', 10),
      TAG_INT_ARRAY = new IntArrayTag('int_array', 11);


module.exports = class NBTReader {
  static parse_nbt(buffer, gzipped = true) {
    if (gzipped)
      buffer = zlib.unzipSync(buffer);

    const r = new stream.Readable();
    r._read = () => {};
    r.push(buffer);

    return Tag.from_stream(r).parse(r);
  }
}
