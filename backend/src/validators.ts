import express from 'express';

export function requireInQuery(req: express.Request, param: string): string {
    if (typeof req.query[param] === "undefined") {
        throw new Error(`{param} must be included as a query param`);
    }
    return req.query[param] as string;
}

export function requireDateTimeInQuery(req: express.Request, param: string): Date {
    const q = requireInQuery(req, param);
    if (!/\d\d\d\d-\d\d-\d\dT\d\d:\d\d\:\d\d\.\d\d\dZ/.test(q)) {
        throw new Error(`'${param}' must be an date time string with full time precision and a 'Z' time zone(https://www.ecma-international.org/ecma-262/11.0/#sec-date.parse), not '${q}'`);
    }
    return new Date(q);
}

export function requireIntInQuery(req: express.Request, param: string): Number {
    const q = requireInQuery(req, param);
    if (!/\d+/.test(q)) {
        throw new Error(`'${param}' must be an int, not '${q}'`);
    }
    return Number.parseInt(q, 10);

}