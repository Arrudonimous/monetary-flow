declare module "node-ofx-parser" {
  export function parse(ofxData: string): unknown;
  export function serialize(header: unknown, body: unknown): string;
}
