import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).lean();
  }

  async create(email: string, password: string) {
    if (typeof password !== 'string' || password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const exists = await this.userModel.exists({ email });
    if (exists) throw new ConflictException('Email already in use');

    // нормализуем раунды соли: [4..15], дефолт 10
    const roundsEnv = process.env.BCRYPT_SALT ?? '10';
    const roundsParsed = parseInt(roundsEnv, 10);
    const rounds = Math.min(15, Math.max(4, Number.isFinite(roundsParsed) ? roundsParsed : 10));

    const hash = await bcrypt.hash(password, rounds);

    try {
      const created = await this.userModel.create({ email, password: hash });
      const obj = created.toObject() as any;
      delete obj.password; // или Reflect.deleteProperty(obj, 'password');
      return obj;
    } catch (e: any) {
      if (e?.code === 11000) throw new ConflictException('Email already in use');
      throw e;
    }
  }

  async validate(email: string, password: string) {
    const user = await this.userModel.findOne({ email }).select('+password').exec();
    if (!user) return null;
    const ok = await bcrypt.compare(password ?? '', user.password ?? '');
    if (!ok) return null;
    const obj = user.toObject() as any;
    delete obj.password;
    return obj;
  }
}
