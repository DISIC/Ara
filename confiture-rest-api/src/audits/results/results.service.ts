import { PrismaService } from "src/prisma.service";

export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}
}
