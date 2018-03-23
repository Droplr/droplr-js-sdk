/* eslint class-methods-use-this: 0, no-underscore-dangle: 0 */
import _ from 'lodash';
import axios from 'axios';
import Cookies from 'js-cookie';
import autobind from 'auto-bind';

import ApiError from './ApiError';
import AxiosResponseFormatter from './AxiosResponseFormatter';

class AxiosClient {
  constructor(config) {
    this.apiUrl = config.url;
    this.logger = config.logger || console;
    autobind(this);
  }

  _handleAuthHeader(res) {
    const authHeader = res.headers['x-droplr-authorization'];
    if (authHeader) {
      const jwtToken = authHeader.split(' ')[1];
      this._setJwtToken(jwtToken);
    }
  }

  _setJwtToken(jwtToken) {
    Cookies.set('jwtToken', jwtToken, {
      expires: 7,
      domain: this.config.self.host,
    });
  }

  _getJwtToken(jwtToken) {
    return Cookies.get('jwtToken') || jwtToken;
  }

  _removeJwtToken() {
    Cookies.remove('jwtToken', {
      domain: this.config.self.host,
    });
    delete this.jwtToken;
  }

  _addAuth(config, jwtToken) {
    const localConfig = config;
    const jwt = this._getJwtToken(jwtToken);

    if (jwt) localConfig.headers.authorization = `Bearer ${jwt}`;

    return localConfig;
  }

  _createRequestConfig(jwtToken) {
    let config = {
      headers: {},
    };

    config = this._addAuth(config, jwtToken);

    return config;
  }

  _normalizeLogObject(obj, config) {
    try {
      return AxiosResponseFormatter.format(obj, config);      
    } catch (err) {
      logger.error(err);
    }
  }

  _handleResponse(config) {
    return (res) => {
      this._handleAuthHeader(res);
      logger.debug('Recieved API response', this._normalizeLogObject(res, config));
      return res;
    };
  }

  _handleError(err) {
    if (!(err.config || err.response)) {
      logger.error('Caught unexpected error non-api error', err.message);
      throw err;
    }

    const apiError = new ApiError(err);

    if (apiError.code === 'Authentication.InvalidJWTToken') this._removeJwtToken();

    logger.error('Received API error', apiError);

    throw apiError;
  }

  _request(method, path, config, jwtToken) {
    const baseConfig = this._createRequestConfig(jwtToken);
    const finalConfig = _.merge(baseConfig, config);
    finalConfig.url = path;
    finalConfig.method = method;

    return axios.request(finalConfig)
      .then(this._handleResponse(finalConfig))
      .catch(this._handleError.bind(this));
  }

  get(path, config = {}, jwtToken) {
    return this._request('get', `${this.apiUrl}/${path}`, config, jwtToken);
  }

  put(path, data, config = {}) {
    const localConfig = config;
    localConfig.data = data;

    return this._request('put', `${this.apiUrl}/${path}`, localConfig);
  }

  post(path, data, config = {}) {
    const localConfig = config;
    localConfig.data = data;

    return this._request('post', `${this.apiUrl}/${path}`, localConfig);
  }
}

export default AxiosClient;
