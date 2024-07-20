class CustomError {
  constructor(message, code) {
    this.message = message;
    this.code = code;
  }
}
class AuthError{
  constructor(errType = 'failedAuthorizeUser', code = 500){
    this.errType = errType;
    this.code = code;
  }
}
class SignInError{
  constructor(path = 'signInErrorGeneral', msg = '',code = 500){
    this.path = path;
    this.code = code;
    this.msg = msg;
  }
}

export { CustomError, AuthError, SignInError };