export class HttpError extends Error {
  status: number;
  body: any;

  constructor(message: string, status: number, body: any = null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}