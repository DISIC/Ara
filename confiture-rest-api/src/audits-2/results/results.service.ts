import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { ResultResponseDto } from "./dto/result-response.dto";
import { UpdateResultRequestDto } from "./dto/update-result-request.dto";

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  //
  // CRUD methods
  //

  async getResults(
    uniqueId: string,
    slug: string
  ): Promise<ResultResponseDto[]> {
    throw "todo"
  }

  async updateResult(
    uniqueId: string,
    slug: string,
    topic: number,
    criterion: number,
    data: UpdateResultRequestDto
  ): Promise<ResultResponseDto> {
    throw "todo";
  }

  //
  // Action methods
  //

  async prefillNotApplicableTopics(
    _auditUniqueId: string,
    _notApplicableTopics: number[]
  ) {
    // TODO: implement this
    return;
  }
}
