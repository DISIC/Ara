import type { Prisma, Audit as BaseAudit } from "../generated/prisma/client";
import { Ability } from "@casl/ability";
// src/casl-prisma.ts
import {
  accessibleBy,
  createPrismaAbility,
  ParsingQueryError,
  PrismaModel,
  prismaQuery,
  type Model,
  type PrismaQueryOf,
  type Subjects,
  type WhereInputOf
} from "@casl/prisma/runtime";

export { accessibleBy, createPrismaAbility, ParsingQueryError, prismaQuery };

type Audit = Pick<BaseAudit, "auditorEmail">;

export type PrismaQuery<T extends PrismaModel = Model<any, any>> =
  PrismaQueryOf<Prisma.TypeMap, T>;
export type WhereInput<TModelName extends Prisma.ModelName> =
  WhereInputOf<Prisma.TypeMap, TModelName>;
export type AppSubjects = Subjects<{
  Audit: Audit;
}>;

export type AppAbility = Ability<["create" | "read" | "update" | "delete", "all" | AppSubjects], PrismaQuery>;
