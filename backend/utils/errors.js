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
  constructor(type = 'sign-in-error', msg = '',code = 500){
    this.type = type;
    this.code = code;
    this.msg = msg;
  }
}

export { CustomError, AuthError, SignInError };