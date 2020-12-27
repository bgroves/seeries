import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

export class Sensorpush {
    constructor(readonly email :string, readonly password :string) {}
}

function requireStrEnv(key :string) :string {
    const value :string | undefined = process.env[key];
    if (value === undefined) {
        throw new Error(`${key} must be defined in process.env!`);
    }
    return value;
}

export const sensorpush = new Sensorpush(requireStrEnv('SENSORPUSH_EMAIL'), requireStrEnv('SENSORPUSH_PASSWORD'));