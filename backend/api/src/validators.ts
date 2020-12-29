import express from "express";

export class ValidationError extends Error {}

export function validationErrorHandler(
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  if (res.headersSent || !(err instanceof ValidationError)) {
    next(err);
  }
  res.status(400);
  res.send(err.message);
}

export function requireInQuery(req: express.Request, param: string): string {
  if (typeof req.query[param] === "undefined") {
    throw new ValidationError(`'${param}' must be included as a query param`);
  }
  return req.query[param] as string;
}

export function requireSetMemberInQuery(
  req: express.Request,
  param: string,
  possibilities: Set<string>
): string {
  const q = requireInQuery(req, param);
  if (!possibilities.has(q)) {
    throw new ValidationError(
      `${param} must be one of ${[...possibilities].toString()}. Got '${q}'`
    );
  }
  return q;
}

export function requireDateTimeInQuery(
  req: express.Request,
  param: string
): Date {
  const q = requireInQuery(req, param);
  if (!/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\dZ$/.test(q)) {
    throw new ValidationError(
      `'${param}' must be an date time string with full time precision and a 'Z' time zone(https://www.ecma-international.org/ecma-262/11.0/#sec-date.parse), not '${q}'`
    );
  }
  return new Date(q);
}

export function requireIntInQuery(req: express.Request, param: string): number {
  const q = requireInQuery(req, param);
  if (!/^\d+$/.test(q)) {
    throw new ValidationError(`'${param}' must be an int, not '${q}'`);
  }
  return Number.parseInt(q, 10);
}
