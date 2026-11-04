export class AppError extends Error {
  constructor(code, status = 400, fields = {}) {
    super(code);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

export function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
