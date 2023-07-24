export class NoMessageResponseError extends Error {
  constructor() {
    super("No message response");
  }
}
