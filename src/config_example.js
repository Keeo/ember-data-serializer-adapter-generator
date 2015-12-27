export default {
  model: {
    directory: 'T:/ember/app/models',

    fileEncoding: 'utf8',

    /**
     *   I. group field name
     *  II. group hasMany or belongsTo
     * III. group async:true, false,.. | optional
     */
    regexHasMany: /(\w+): *(?:DS.)?hasMany\((?:'|")([\w-_]+)(?:'|"), (\{.*\})?\),?/,
    regexBelongsTo: /(\w+): *(?:DS.)?belongsTo\((?:'|")([\w-_]+)(?:'|"), (\{.*\})?\),?/,
    regexAttribute: /(\w+): *(?:DS.)?attr.*/,
    async: /(?:'|")?async(?:'|")?: ?(true|false)/
  },
  adapter: {
    namespace: 'Acme\\UserBundle',
    data: {
      padding: ',\n            ',
      trailingComma: true
    },

    /**
     * Override async property.
     */
    async: {
      company: true
    }
  }
}