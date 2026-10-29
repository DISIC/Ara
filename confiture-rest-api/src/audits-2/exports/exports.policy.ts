import { Policy } from "@nestjs/authorization";

@Policy()
export class ExportsPolicy {
  read(): boolean {
    return true;
  }
}
