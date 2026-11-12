import { Injectable } from "@nestjs/common";

@Injectable()
export class ResultsService {
  constructor() {}

  async prefillNotApplicableTopics(_auditUniqueId: string, _notApplicableTopics: number[]) {
    // TODO: implement this
    return;
  }
}
