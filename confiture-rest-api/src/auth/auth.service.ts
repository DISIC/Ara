import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '@prisma/client/runtime';
import { compare, hash } from 'bcrypt';
import { JsonWebTokenError, sign, verify } from 'jsonwebtoken';
import { nanoid } from 'nanoid';

import { PrismaService } from '../prisma.service';
import { AccountVerificationJwtPayload } from './jwt-payloads';

export class UsernameAlreadyExistsError extends Error {
  readonly username: string;

  constructor(username: string) {
    super(`Username ${username} alredy exists.`);
    this.name = 'UsernameAlreadyExistsError';
    this.username = username;
  }
}

export class InvalidVerificationTokenError extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'InvalidVerificationTokenError';
  }
}

export class SigninError extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'SigninError';
  }
}

export class TokenRegenerationError extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'TokenRegenerationError';
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Create a new unverified user and return a verification token.
   */
  async createUnverifiedUser(
    username: string,
    password: string,
  ): Promise<string> {
    const passwordHash = await hash(password, 10);

    // Check if an already verified user exists with this username
    await this.prisma.user.findUnique({ where: { username } }).then((user) => {
      if (user?.isVerified) {
        throw new UsernameAlreadyExistsError(username);
      }
    });

    // We use upsert because the user might already exist but is not verified yet.
    const unverifiedUser = await this.prisma.user.upsert({
      where: { username },
      create: {
        username,
        password: passwordHash,
        isVerified: false,
        verificationJti: nanoid(),
      },
      update: {
        password: passwordHash,
        verificationJti: nanoid(),
      },
    });

    const verificationToken = this.generateVerificationToken(
      username,
      unverifiedUser.verificationJti,
    );

    return verificationToken;
  }

  /**
   * Generate a new verification token and invalidates the previous one.
   */
  async regenerateVerificationToken(username: string): Promise<string> {
    {
      const user = await this.prisma.user.findUnique({ where: { username } });
      if (!user) {
        throw new TokenRegenerationError('User not found');
      }

      if (user.isVerified) {
        throw new TokenRegenerationError('User is already verified');
      }
    }

    const newJti = nanoid();
    await this.prisma.user.update({
      where: { username },
      data: { verificationJti: newJti },
    });

    const verificationToken = this.generateVerificationToken(username, newJti);
    return verificationToken;
  }

  async verifyAccount(token: string) {
    const secret = this.config.get<string>('ACCOUNT_VERIFICATION_SECRET');

    try {
      const payload = verify(token, secret) as AccountVerificationJwtPayload;
      const { sub: username, jti } = payload;

      // Addition checks : user exists, user needs verification, token is the last one
      {
        const user = await this.prisma.user.findUnique({
          where: {
            username,
          },
        });

        if (!user) {
          throw new InvalidVerificationTokenError('User not found');
        }

        if (user.isVerified) {
          throw new InvalidVerificationTokenError('User is already verified');
        }

        if (user.verificationJti !== jti) {
          throw new InvalidVerificationTokenError(
            'Token is not the latest generated token',
          );
        }
      }

      await this.prisma.user.update({
        where: { username },
        data: {
          isVerified: true,
          verificationJti: null,
        },
      });
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        throw new InvalidVerificationTokenError('Invalid JWT');
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

  async isAccountVerified(username: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      return false;
    }
    return user.isVerified;
  }

  async getEmailFromVerificationToken(token: string) {
    const secret = this.config.get<string>('ACCOUNT_VERIFICATION_SECRET');
    try {
      const payload = verify(token, secret) as AccountVerificationJwtPayload;
      const { sub: email } = payload;

      return email
    }
    catch (e) {
      if (e instanceof JsonWebTokenError) {
        throw new InvalidVerificationTokenError('Invalid JWT');
      }
      throw e;
    }
  }

  private generateVerificationToken(username: string, jti: string): string {
    const secret = this.config.get<string>('ACCOUNT_VERIFICATION_SECRET');
    const payload: AccountVerificationJwtPayload = {
      sub: username,
      jti,
    };
    const verificationToken = sign(payload, secret, { expiresIn: '1h' });
    return verificationToken;
  }
}
