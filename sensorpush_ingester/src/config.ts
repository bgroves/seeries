import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

export class Sensorpush {
    constructor(readonly email :string, readonly password :string) {}
}

function requireStrEnv(key :string) :string {
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) { 
        throw new Error(`Must have ${key} defined in env!`);
    }
    const value :any = process.env[key];
    if (typeof value !== "string") {
        throw new Error(`${key} must be a string process.env, but is ${value}!`);
    }
    return value;
}

export const sensorpush = new Sensorpush(requireStrEnv('SENSORPUSH_EMAIL'), requireStrEnv('SENSORPUSH_PASSWORD'));