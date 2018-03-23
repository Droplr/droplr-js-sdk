import AxiosResponseFormatter from './AxiosResponseFormatter';

class ApiError extends Error {
  constructor(axiosError) {
    super(axiosError);
    super.name = 'ApiError';
    this.name = 'ApiError';
    this.stack = axiosError.stack;
    super.stack = axiosError.stack;
    const { request, response } = AxiosResponseFormatter.format(axiosError);
    this.request = request;
    this.response = response;

    this.code = response.body.code;
    this.message = response.body.message;
    this.statusCode = response.body.statusCode;
  }
}

export default ApiError;
