import { AbilityBuilder } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { AppAbility, createPrismaAbility } from "./casl-prisma";

interface User {
  username: string;
  isVerified: boolean;
}

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

    can("read", "Audit", { isHidden: false });
    can("delete", "Audit", { auditorEmail: user.username });

    return build();
  }
}
