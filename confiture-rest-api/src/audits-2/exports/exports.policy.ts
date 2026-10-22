import { Policy } from "@nestjs/authorization";

@Policy()
export class ExportsPolicy {
  constructor() { }

  export(): boolean {
    return true;
  }
}
