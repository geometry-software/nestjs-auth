import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../auth/dto';
import { User, UserDocument } from './schemas/user.schema';

export type AuthUserOut = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.trim().toLowerCase() }).exec();
  }

  async create(dto: RegisterDto): Promise<AuthUserOut> {
    if (typeof dto.password !== 'string' || dto.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const email = dto.email.trim().toLowerCase();
    const exists = await this.userModel.exists({ email });

    if (exists) {
      throw new ConflictException('Email already in use');
    }

    const hash = await bcrypt.hash(dto.password, this.getSaltRounds());

    try {
      const created = await this.userModel.create({
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email,
        password: hash,
      });

      const obj = created.toObject() as any;
      return this.mapToOut(obj);
    } catch (e: any) {
      if (e?.code === 11000) {
        throw new ConflictException('Email already in use');
      }

      throw e;
    }
  }

  async validate(email: string, password: string) {
    const user = await this.userModel
      .findOne({ email: email.trim().toLowerCase() })
      .select('+password')
      .exec();

    if (!user) {
      return null;
    }

    const ok = await bcrypt.compare(password ?? '', user.password ?? '');
    if (!ok) {
      return null;
    }

    const obj = user.toObject() as any;
    delete obj.password;

    return {
      ...obj,
      id: String(obj._id),
    };
  }

  private mapToOut(doc: any): AuthUserOut {
    return {
      id: String(doc._id),
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      createdAt: new Date(doc.createdAt).toISOString(),
      updatedAt: new Date(doc.updatedAt).toISOString(),
    };
  }

  private getSaltRounds(): number {
    const roundsEnv = process.env.BCRYPT_SALT ?? '10';
    const roundsParsed = parseInt(roundsEnv, 10);
    return Math.min(15, Math.max(4, Number.isFinite(roundsParsed) ? roundsParsed : 10));
  }
}