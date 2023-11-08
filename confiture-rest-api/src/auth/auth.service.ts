import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { nanoid } from 'nanoid';

import { PrismaService } from '../prisma.service';
import {
  AccountVerificationJwtPayload,
  AuthenticationJwtPayload,
  NewEmailVerificationJwtPayload,
  RequestPasswordResetJwtPayload,
} from './jwt-payloads';

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
    const passwordHash = await this.hashPassword(password);

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
      name: user.name,
      org: user.orgName,
    };
    const token = await this.jwt.signAsync(payload, { expiresIn: '24h' });

    return token;
  }

  /** Generate a new auth token. */
  async refreshToken(uid: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { uid } });
    if (!user) {
      throw new SigninError('unknown_user');
    }
    if (!user.isVerified) {
      throw new SigninError('unknown_user');
    }
    const payload: AuthenticationJwtPayload = {
      sub: user.uid,
      email: user.username,
      name: user.name,
      org: user.orgName,
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
      verification: 'new-account',
      sub: uid,
      email,
      jti,
    };
    const verificationToken = this.jwt.signAsync(payload, { expiresIn: '1h' });
    return verificationToken;
  }

  async checkCredentials(username: string, password: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    return user && user.isVerified && (await compare(password, user.password));
  }

  async checkCredentialsWithUid(
    uid: string,
    password: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { uid } });
    return user && user.isVerified && (await compare(password, user.password));
  }

  async deleteAccount(username: string) {
    await this.prisma.user.delete({ where: { username } });
  }

  async updatePassword(username: string, newPassword: string) {
    const hash = await this.hashPassword(newPassword);
    await this.prisma.user.update({
      where: { username },
      data: { password: hash },
    });
  }

  private hashPassword(password: string) {
    return hash(password, 10);
  }

  async addNewEmail(uid: string, newEmail: string) {
    // Check if an user already exists with this username
    await this.prisma.user
      .findUnique({ where: { username: newEmail } })
      .then((user) => {
        if (user) {
          throw new UsernameAlreadyExistsError(newEmail);
        }
      });

    const user = await this.prisma.user.update({
      where: { uid },
      data: {
        newEmail,
        newEmailVerificationJti: nanoid(),
      },
    });

    const verificationToken = await this.generateNewEmailVerificationToken(
      user.uid,
      newEmail,
      user.newEmailVerificationJti,
    );

    return verificationToken;
  }

  private generateNewEmailVerificationToken(
    uid: string,
    email: string,
    jti: string,
  ): Promise<string> {
    const payload: NewEmailVerificationJwtPayload = {
      verification: 'update-email',
      sub: uid,
      email,
      jti,
    };
    const verificationToken = this.jwt.signAsync(payload, { expiresIn: '1h' });
    return verificationToken;
  }

  /** Generate a new *email update* verification token and update the stored jti for given user. */
  async regenerateEmailUpdateVerificationToken(
    uid: string,
  ): Promise<{ email: string; token: string }> {
    const user = await this.prisma.user.findUnique({ where: { uid } });
    if (!user) {
      throw new TokenRegenerationError('User not found');
    }

    if (!user.newEmail) {
      throw new TokenRegenerationError(
        'User is not in the process of updating email',
      );
    }

    const newJti = nanoid();
    await this.prisma.user.update({
      where: { uid },
      data: { newEmailVerificationJti: newJti },
    });
    const token = await this.generateNewEmailVerificationToken(
      user.uid,
      user.newEmail,
      newJti,
    );

    return { token, email: user.newEmail };
  }

  /** Cancel email update by invalidating the verification token. */
  async cancelEmailUpdate(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { username: email },
    });
    if (!user) {
      throw new TokenRegenerationError('User not found');
    }

    await this.prisma.user.update({
      where: { username: email },
      data: { newEmailVerificationJti: null },
    });
  }

  async verifyEmailUpdate(token: string) {
    const payload = (await this.jwt.verifyAsync(token).catch(() => {
      throw new InvalidVerificationTokenError('Invalid JWT');
    })) as NewEmailVerificationJwtPayload;
    const { sub: uid, jti, email } = payload;

    // Addition checks : user exists, user needs email update verification, token is the last one
    {
      const user = await this.prisma.user.findUnique({ where: { uid } });

      if (!user) {
        throw new InvalidVerificationTokenError('User not found');
      }

      if (!user.newEmail) {
        throw new InvalidVerificationTokenError('No pending email update');
      }

      if (user.newEmailVerificationJti !== jti) {
        throw new InvalidVerificationTokenError(
          'Token is not the latest generated token',
        );
      }
    }

    await this.prisma.user.update({
      where: { uid },
      data: {
        username: email,
        newEmail: null,
        newEmailVerificationJti: null,
      },
    });
  }

  async userHasEmail(uid: string, email: string) {
    try {
      await this.prisma.user.findFirstOrThrow({
        where: { uid, username: email, newEmail: null },
      });
      return true;
    } catch {
      return false;
    }
  }

  async generatePasswordResetVerificationToken(email: string) {
    // verify user exists
    await this.prisma.user
      .findUniqueOrThrow({ where: { username: email } })
      .catch(() => {
        throw new TokenRegenerationError('User not found');
      });

    const payload: RequestPasswordResetJwtPayload = {
      email,
    };
    const verificationToken = this.jwt.signAsync(payload, { expiresIn: '1h' });
    return verificationToken;
  }

  async resetPassword(newPassword: string, token: string) {
    const { email } = (await this.jwt.verifyAsync(token).catch(() => {
      throw new InvalidVerificationTokenError('Invalid JWT');
    })) as NewEmailVerificationJwtPayload;

    const hash = await this.hashPassword(newPassword);

    await this.prisma.user
      .update({
        where: { username: email },
        data: {
          password: hash,
        },
      })
      .catch((err) => {
        // User not found
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        if (err?.code === 'P2025') {
          throw new InvalidVerificationTokenError('User not found');
        }
        throw err;
      });

    return email;
  }
}
