import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt';
import { JsonWebTokenError, verify } from 'jsonwebtoken';

import { PrismaService } from 'src/prisma.service';

export class UsernameAlreadyExistsError extends Error {
  readonly username: string;

  constructor(username: string) {
    super(`Username ${username} alredy exists.`);
    this.name = 'UsernameAlreadyExistsError';
    this.username = username;
  }
}

export class InvalidVerificationTokenError extends Error {
  constructor() {
    super();
    this.name = 'InvalidVerificationTokenError';
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async createUnverifiedUser(username: string, password: string) {
    const passwordHash = await hash(password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          username,
          password: passwordHash,
          isVerified: false,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new UsernameAlreadyExistsError(username);
        }
      }
      throw e;
    }
  }

  async verifyAccount(token: string) {
    const secret = this.config.get<string>('ACCOUNT_VERIFICATION_SECRET');

    try {
      const payload = verify(token, secret);
      const username = payload.sub as string;

      await this.prisma.user.update({
        where: { username },
        data: { isVerified: true },
      });
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        throw new InvalidVerificationTokenError();
      }
      throw e;
    }
  }
}
