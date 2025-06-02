import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

const saltRounds = 10;

@Injectable ()
export class HashingService {
  async hash(value: string): Promise<string> {
    return await hash(value, saltRounds);
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return await compare(value, hash);
  }

}

