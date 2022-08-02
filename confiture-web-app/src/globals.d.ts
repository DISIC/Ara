export {};

type Dsfr = (...args: any[]) => any;

declare global {
  const dsfr: Dsfr;

  interface Window {
    dsfr: Dsfr;
  }
}
