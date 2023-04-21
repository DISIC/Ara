import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { JsonWebTokenError, verify, sign } from 'jsonwebtoken';

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

export class SigninError extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'SigninError';
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

  /**
   * Verify user credentials and return an authentication token.
   */
  async signin(username: string, password: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user) {
      throw new SigninError('User not found');
    }

    if (!user.isVerified) {
      throw new SigninError('User is not verified');
    }

    const match = await compare(password, user.password);

    if (!match) {
      throw new SigninError('Wrong password');
    }

    const secret = this.config.get<string>('AUTHENTICATION_SECRET');
    const payload = { sub: user.username };
    const token = sign(payload, secret, { expiresIn: '24h' });

    return token;
  }
}
