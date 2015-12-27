import fs from 'fs-extra';
import config from './config.js';
import S from 'string';
import path from 'path';
import inflection from 'inflection';
import mkdirp from 'mkdirp';

export default class Converter {
  constructor() {
    this.outputDirectory = config.adapter.directory ? config.adapter.directory : __dirname + path.sep + '..' + path.sep + 'output';
    fs.emptydirSync(this.outputDirectory);
  }

  convert() {
    let models = fs.readdirSync(config.model.directory);
    let services = [];
    models.forEach(modelFile => {
      if (S(modelFile).startsWith('.')) {
        return;
      }
      console.log("> converting model: " + modelFile);

      let model = fs.readFileSync(S(config.model.directory).ensureRight(path.sep) + modelFile, {encoding: config.model.fileEncoding});
      let modelName = this.parseModelName(modelFile);
      let variables = {
        data: this.parseData(model),
        namespace: config.adapter.namespace,
        model: this.camelize(modelName),
        nameSingular: inflection.singularize(modelName),
        namePlural: inflection.pluralize(modelName)
      };
      this.export(variables);
      services.push(variables.model);
    });
    this.exportServices(services);
  }

  exportServices(services){
    let data = 'services:\n';
    services.forEach(service => {
      data += `    ${config.adapter.serviceTemplateName}\\${service}:\n`;
      data += `        ${config.adapter.serviceTemplateClass}\\${service}Adapter\n`;
    });
    fs.ensureDirSync(this.outputDirectory);
    fs.writeFileSync(S(this.outputDirectory).ensureRight(path.sep) + 'adapters.yml', data);
  }

  export(variables) {
    let template = this.getTemplate();

    for (let key in variables) {
      if (key === 'data') {
        let data = variables['data'].join(config.adapter.data.padding) + (config.adapter.data.trailingComma ? ',' : '');
        template = template.replace('${data}', data);
      } else {
        template = S(template).replaceAll('${' + key + '}', variables[key]);
      }
    }

    this.saveTemplate(variables.model, template);
  }

  saveTemplate(fileName, template) {
    fs.ensureDirSync(this.outputDirectory);
    fs.writeFileSync(S(this.outputDirectory).ensureRight(path.sep) + fileName + 'Adapter.php', template);
  }

  parseModelName(fileName) {
    return S(fileName).chompRight('.js');
  }

  parseData(model) {
    let data = [];
    S(model).lines().forEach(line => {
      let manyMatches = config.model.regexHasMany.exec(line);
      if (manyMatches) {
        let getter = this.camelizePluralize(manyMatches[1]);
        let async = this.isSideLoaded(manyMatches[2], manyMatches[3]) ? 'true' : 'false';
        data.push(`'${manyMatches[1]}' => [$object->get${getter}(), ${async}]`);
      }

      let belongsMatches = config.model.regexBelongsTo.exec(line);
      if (belongsMatches) {
        let getter = this.camelize(belongsMatches[1]);
        let async = this.isSideLoaded(belongsMatches[2], belongsMatches[3]) ? 'true' : 'false';
        data.push(`'${belongsMatches[1]}' => [$object->get${getter}(), ${async}]`);
      }

      let attrMatches = config.model.regexAttribute.exec(line);
      if (attrMatches) {
        let getter = this.camelize(attrMatches[1]);
        data.push(`'${attrMatches[1]}' => [$object->get${getter}(), false]`);
      }
    });
    return data;
  }

  isSideLoaded(model, block) {
    let forced = config.adapter.sideLoad[inflection.camelize(S(model).replaceAll('-', '_'), true)];
    if (forced !== undefined) {
      return forced;
    }

    if (S(block).contains('async')) {
      var async = config.model.async.exec(block);
      if (async[1] === 'true') {
        return false;
      }
      if (async[1] === 'false') {
        return true;
      }
      console.error('Debug: ', async);
      throw 'Undefined async. Check regex or your model.';
    } else {
      return false;
    }
  }

  getTemplate() {
    return fs.readFileSync(`${__dirname}${path.sep}..${path.sep}adapter.template`, {encoding: 'utf8'});
  }

  camelizePluralize(str) {
    return inflection.transform(S(str).replaceAll('-', '_').s, ['camelize', 'pluralize']);
  }

  camelize(str) {
    return inflection.camelize(S(str).replaceAll('-', '_').s);
  }
}