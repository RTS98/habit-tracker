class AuthenticationError extends Error {
  constructor(message: string = "Not authenticated") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export { AuthenticationError };
