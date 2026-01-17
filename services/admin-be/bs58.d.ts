declare module 'bs58' {
  export function decode(str: string): Uint8Array;
  export function encode(bytes: Uint8Array | number[]): string;
  
  const bs58: {
    decode(str: string): Uint8Array;
    encode(bytes: Uint8Array | number[]): string;
  };
  
  export default bs58;
}
