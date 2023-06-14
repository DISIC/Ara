import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { nanoid } from 'nanoid';

import { PrismaService } from '../prisma.service';
import {
  AccountVerificationJwtPayload,
  AuthenticationJwtPayload,
} from './jwt-payloads';
import { JwtService } from '@nestjs/jwt';

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
    private readonly jwt: JwtService,
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

    const verificationToken = await this.generateVerificationToken(
      unverifiedUser.uid,
      username,
      unverifiedUser.verificationJti,
    );

    return verificationToken;
  }

  /**
   * Generate a new verification token and invalidates the previous one.
   */
  async regenerateVerificationToken(username: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new TokenRegenerationError('User not found');
    }

    if (user.isVerified) {
      throw new TokenRegenerationError('User is already verified');
    }

    const newJti = nanoid();
    await this.prisma.user.update({
      where: { username },
      data: { verificationJti: newJti },
    });

    const verificationToken = await this.generateVerificationToken(
      user.uid,
      user.username,
      newJti,
    );
    return verificationToken;
  }

  async verifyAccount(token: string) {
    const payload = (await this.jwt.verifyAsync(token).catch(() => {
      throw new InvalidVerificationTokenError('Invalid JWT');
    })) as AccountVerificationJwtPayload;
    const { sub: uid, jti } = payload;

    // Addition checks : user exists, user needs verification, token is the last one
    {
      const user = await this.prisma.user.findUnique({ where: { uid } });

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
      where: { uid },
      data: {
        isVerified: true,
        verificationJti: null,
      },
    });
  }

  /**
   * Verify user credentials and return an authentication token.
   */
  async signin(username: string, password: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user) {
      throw new SigninError('unknown_user');
    }

    if (!user.isVerified) {
      throw new SigninError('unknown_user');
    }

    const match = await compare(password, user.password);

    if (!match) {
      throw new SigninError('wrong_password');
    }

    const payload: AuthenticationJwtPayload = {
      sub: user.uid,
      email: user.username,
    };
    const token = await this.jwt.signAsync(payload, { expiresIn: '24h' });

    return token;
  }

  async isAccountVerified(username: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    return !!user && user.isVerified;
  }

  async getEmailFromVerificationToken(token: string) {
    const payload = await this.jwt.verifyAsync(token).catch(() => {
      throw new InvalidVerificationTokenError('Invalid JWT');
    });
    const { email } = payload;

    return email;
  }

  private generateVerificationToken(
    uid: string,
    email: string,
    jti: string,
  ): Promise<string> {
    const payload: AccountVerificationJwtPayload = {
      sub: uid,
      email,
      jti,
    };
    const verificationToken = this.jwt.signAsync(payload, { expiresIn: '1h' });
    return verificationToken;
  }
}
