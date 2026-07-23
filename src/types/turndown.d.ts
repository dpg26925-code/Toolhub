declare module "turndown" {
  export default class Turndown {
    constructor(options?: Record<string, unknown>);
    turndown(html: string): string;
  }
}