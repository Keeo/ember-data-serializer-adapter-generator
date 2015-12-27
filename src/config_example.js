export default {
  model: {
    directory: '/ember/app/models',

    fileEncoding: 'utf8',

    /**
     *  I. group field name
     * II. group async:true, false
     */
    regexHasMany: /(\w+): *(?:DS.)?hasMany\((?:'|")([\w-_]+)(?:'|"), (\{.*\})?\),?/,
    regexBelongsTo: /(\w+): *(?:DS.)?belongsTo\((?:'|")([\w-_]+)(?:'|"), (\{.*\})?\),?/,
    regexAttribute: /(\w+): *(?:DS.)?attr.*/,
    async: /(?:'|")?async(?:'|")?: ?(true|false)/
  },
  adapter: {
    namespace: 'Acme\\AcmeBundle',
    directory: '/src/Acme/AcmeBundle/Entity/EmberDataSerializerAdapter',
    data: {
      padding: ',\n            ',
      trailingComma: true
    },
    serviceTemplateName: 'acme.acmebundle.ember_data_serializer_adapter',
    serviceTemplateClass: 'class: Acme\\AcmeBundle\\Entity\\EmberDataSerializerAdapter',

    /**
     * Override sideLoad property.
     */
    sideLoad: {
      user: false,
      userGroup: true
    }
  }
}