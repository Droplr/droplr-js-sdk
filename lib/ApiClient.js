/* eslint class-methods-use-this: 0, no-underscore-dangle: 0 */
import autobind from 'react-auto-bind';

import AxiosClient from './AxiosClient';

class ApiClient extends AxiosClient {
  constructor(config) {
    super(config);
    autobind(this);
  }

  getUser(jwtToken) {
    const path = 'account';
    if (!super._getJwtToken(jwtToken)) {
      return Promise.reject('Cant fetch account data without jwtToken');
    }

    return this.get(path, null, jwtToken);
  }

  getDrop(code, password = null, contentDisposition = 'inline', jwtToken) {
    const path = `drops/${code}`;

    const config = {
      headers: {},
      params: {},
    };
    if (password) {
      config.headers['x-drop-password'] = password;
    }
    if (contentDisposition) {
      config.params['content-disposition'] = contentDisposition;
    }

    return this.get(path, config, jwtToken);
  }

  postDrop(id, data, fileName, contentType, pixelDensity, options, progressHandler) {
    const path = 'files';

    const onUploadProgress = (progressEvent) => {
      progressHandler(id, fileName, progressEvent);
    };

    const config = {
      headers: {
        'content-type': contentType,
      },
      params: {
        filename: fileName,
      },
      onUploadProgress,
    };

    if (pixelDensity) {
      config.params['pixel_density'] = pixelDensity;
    }

    if (options.board) {
      config.params['board'] = options.board;
    }

    return this.post(path, data, config);
  }

  putDrop(code, data) {
    const path = `drops/${code}`;

    return this.put(path, data);
  }

  getDrops(board, offset = 0, amount = 50) {
    const path = 'drops';

    const config = {
      params: {
        board,
        amount,
        offset,
      },
    };

    return this.get(path, config);
  }

  postDropView(code, data) {
    const path = `drops/${code}/view`;
    return this.post(path, data);
  }

  getTeam(id) {
    const path = `teams/${id}`;
    return this.get(path);
  }

  getBoard(code) {
    const path = `boards/${code}`;
    return this.get(path);
  }

  getBoardsList(jwtToken) {
    const path = 'boards';
    return this.get(path, null, jwtToken);
  }
  
  postBoard(code, data) {
    const path = `boards`;
    return this.post(path, data);
  }
  
  putBoard(code, data) {
    const path = `boards/${code}`;
    return this.put(path, data);
  }

  watchBoard(code) {
    const path = `boards/${code}/watch`;
    return this.put(path);
  }
}

export default ApiClient;
