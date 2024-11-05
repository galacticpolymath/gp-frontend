class CustomError {
  constructor(message, code = 500, type = '', urlErrorParamKey = '', urlErrorParamVal) {
    this.message = message;
    this.code = code;
    this.type = type;
    this.urlErrorParamKey = urlErrorParamKey;
    this.urlErrorParamVal = urlErrorParamVal;
  }
}
class AuthError {
  constructor(errType = 'failedAuthorizeUser', code = 500, redirectUrl = '', urlErrorParamKey = '', urlErrorParamVal = '') {
    this.errType = errType;
    this.code = code;
    this.redirectUrl = redirectUrl;
    this.urlErrorParamKey = urlErrorParamKey;
    this.urlErrorParamVal = urlErrorParamVal;
  }
}
class AuthMiddlwareError {
  constructor(isAuthorize, errResponse, msg) {
    this.isAuthorize = isAuthorize;
    this.msg = msg;
    this.errResponse = errResponse;
  }
}
class SignInError {
  constructor(type = 'sign-in-error', msg = '', code = 500, urlErrorParamKey = '', urlErrorParamVal = '') {
    this.type = type;
    this.code = code;
    this.msg = msg;
    this.urlErrorParamKey = urlErrorParamKey;
    this.urlErrorParamVal = urlErrorParamVal;
  }
}

export { CustomError, AuthError, SignInError, AuthMiddlwareError };