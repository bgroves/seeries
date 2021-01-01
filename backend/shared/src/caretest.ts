// Based on [baretest](https://github.com/volument/baretest).
// c is the next step from b and caretest is the next step from baretest.
// We're forking it to allow for access to the "onlys" list for running multiple suites in our run
// function.
//
// Here's baretest's MIT license for compliance:
//(The MIT License)
//
// Copyright (c) 2020 OpenJS Foundation and contributors, https://openjsf.org

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//

const // BLACK = 30,
  RED = 31,
  GREEN = 32,
  YELLOW = 33,
  // BLUE = 34,
  // MAGENTA = 35,
  CYAN = 36,
  // WHITE = 37,
  GRAY = 90;
const COLOR_SUPPORTED = process.env.TERM && /color|ansi|cygwin|linux/i.test(process.env.TERM);

function colorize(color: number, msg: string) {
  return COLOR_SUPPORTED ? `\u001b[${color}m${msg}\u001b[39m` : msg;
}

function isError(e: unknown): e is Error {
  return (e as Error).message !== undefined;
}

function prettyError(e: unknown) {
  if (!isError(e) || e.stack === undefined) {
    return colorize(YELLOW, e as string);
  }
  const msg = e.stack;
  const i = msg.indexOf("\n");
  process.stdout.write(colorize(YELLOW, msg.slice(0, i + 1)));
  process.stdout.write(colorize(GRAY, msg.slice(i)));
}

type SyncOrAsyncVoidFunction = () => void | Promise<void>;

interface Test {
  name: string;
  fn: SyncOrAsyncVoidFunction;
}

export class Caretest {
  tests: Test[] = [];
  befores: SyncOrAsyncVoidFunction[] = [];
  afters: SyncOrAsyncVoidFunction[] = [];
  onlys: Test[] = [];
  constructor(readonly headline: string) {}

  only(name: string, fn: SyncOrAsyncVoidFunction): void {
    this.onlys.push({ name, fn });
  }

  before(fn: SyncOrAsyncVoidFunction): void {
    this.befores.push(fn);
  }

  after(fn: SyncOrAsyncVoidFunction): void {
    this.afters.push(fn);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  skip(name: string, fn: SyncOrAsyncVoidFunction): void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }

  test(name: string, fn: SyncOrAsyncVoidFunction): void {
    this.tests.push({ name, fn });
  }

  async run(): Promise<boolean> {
    const tests = this.onlys.length > 0 ? this.onlys : this.tests;

    process.stdout.write(colorize(CYAN, this.headline + " "));

    for (const test of tests) {
      try {
        for (const fn of this.befores) await fn();
        await test.fn();

        process.stdout.write(colorize(GRAY, "• "));
      } catch (e) {
        for (const fn of this.afters) await fn();
        process.stdout.write(colorize(RED, `\n\n! ${test.name} \n\n`));
        prettyError(e);
        return false;
      }
    }

    for (const fn of this.afters) await fn();
    process.stdout.write(colorize(GREEN, `✓ ${tests.length}\n`));
    console.info("\n");
    return true;
  }
}

export async function run(...tests: Caretest[]): Promise<boolean> {
  const onlys = tests.filter((test) => {
    return test.onlys.length > 0;
  });
  if (onlys.length > 0) {
    tests = onlys;
  }
  let allPassed = true;
  for (let i = 0; i < tests.length; i++) {
    allPassed = (await tests[i].run()) && allPassed;
  }
  return allPassed;
}
