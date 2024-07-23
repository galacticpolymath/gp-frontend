class CustomError {
  constructor(message, code = 500, type = '') {
    this.message = message;
    this.code = code;
    this.type = type;
  }
}
class AuthError{
  constructor(errType = 'failedAuthorizeUser', code = 500, redirectUrl = ''){
    this.errType = errType;
    this.code = code;
    this.redirectUrl = redirectUrl;
  }
}
class SignInError{
  constructor(type = 'sign-in-error', msg = '',code = 500){
    this.type = type;
    this.code = code;
    this.msg = msg;
  }
}

export { CustomError, AuthError, SignInError };