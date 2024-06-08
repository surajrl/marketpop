export class AuthRequiredError extends Error {
  constructor(message) {
    super(message);
    this.message = "You must be logged in to access this page.";
    this.name = "AuthRequiredError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.message = "You are not authorized to access this resource.";
    this.name = "UnauthorizedError";
  }
}
