import _ from 'lodash';
import logger from '../utils/logger';

const FIELDS_TO_SANITIZE = ['authorization', 'password', 'x-droplr-authorization', 'email', 'firstName', 'lastName'];
const FIELDS_TO_SANITIZE_REGEXP = new RegExp(FIELDS_TO_SANITIZE.join('|'), 'i');

class AxiosResponseFormatter {
  static format(obj, config) {
    let requestData = {};
    const localConfig = obj.config || config || {};
    if (localConfig.data && Object.keys(localConfig.data).length > 1) {
      requestData = localConfig.data;
    }
    const response = obj.response || obj;
    return {
      request: {
        method: localConfig.method,
        url: localConfig.url,
        headers: AxiosResponseFormatter.sanitize(localConfig.headers),
        params: localConfig.params,
        data: AxiosResponseFormatter.sanitize(requestData),
      },
      response: {
        body: AxiosResponseFormatter.sanitize(response.data),
        headers: AxiosResponseFormatter.sanitize(response.headers),
      },
    };
  }

  static sanitize(obj) {
    let localObject = obj;

    if (_.isString(obj)) {
      try {
        localObject = JSON.parse(obj);
      } catch (e) {
        throw new Error('Couldn\'t parse an object');
      }
    }

    if (_.isArray(localObject)) {
      return localObject.map((v) => {
        if (_.isObject(v)) return AxiosResponseFormatter.sanitize(v);
        return v;
      });
    }

    const newObject = {};

    Object.keys(localObject)
      .forEach((k) => {
        let valToReturn;
        if (_.isObject(localObject[k])) {
          valToReturn = AxiosResponseFormatter.sanitize(localObject[k]);
        }
        if (FIELDS_TO_SANITIZE_REGEXP.test(k) && !valToReturn) {
          valToReturn = localObject[k] && localObject[k].length ? new Array(localObject[k].length).join('*') : 'SANITIZED';
        }
        newObject[k] = valToReturn || localObject[k];
        return null;
      });
    return newObject;
  }
}

export default AxiosResponseFormatter;
