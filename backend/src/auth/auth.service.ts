import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';

const SALT_ROUNDS = 10;
const DEFAULT_USER_EMAIL = 'default@investflow.local';
const DEFAULT_USER_PASSWORD = 'changeme';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureDefaultUserAndBackfill();
  }

  /** Create default user and assign existing investments to it if this is a fresh DB. */
  private async ensureDefaultUserAndBackfill(): Promise<void> {
    const { rows: userRows } = await this.db.query<{ id: string }>(
      'SELECT id FROM users LIMIT 1',
    );
    if (userRows.length > 0) return;

    const hash = await bcrypt.hash(DEFAULT_USER_PASSWORD, SALT_ROUNDS);
    const { rows: insertRows } = await this.db.query<{ id: string }>(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id`,
      [DEFAULT_USER_EMAIL, hash],
    );
    const defaultUserId = insertRows[0].id;

    await this.db.query(
      'UPDATE investments SET user_id = $1 WHERE user_id IS NULL',
      [defaultUserId],
    );
    await this.db.query(
      'ALTER TABLE investments ALTER COLUMN user_id SET NOT NULL',
    );
  }

  async register(email: string, password: string): Promise<{ user: AuthUser; access_token: string }> {
    const normalized = email.trim().toLowerCase();
    const { rows: existing } = await this.db.query(
      'SELECT id FROM users WHERE email = $1',
      [normalized],
    );
    if (existing.length > 0) {
      throw new ConflictException('Email already registered');
    }
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await this.db.query<{ id: string; email: string }>(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [normalized, hash],
    );
    const user = { id: rows[0].id, email: rows[0].email };
    const access_token = this.jwt.sign({ sub: user.id, email: user.email });
    return { user, access_token };
  }

  async validateUser(email: string, password: string): Promise<AuthUser | null> {
    const normalized = email.trim().toLowerCase();
    const { rows } = await this.db.query<{ id: string; email: string; password_hash: string }>(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [normalized],
    );
    if (rows.length === 0) return null;
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return null;
    return { id: rows[0].id, email: rows[0].email };
  }

  async login(email: string, password: string): Promise<{ user: AuthUser; access_token: string }> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const access_token = this.jwt.sign({ sub: user.id, email: user.email });
    return { user, access_token };
  }

  async findUserById(id: string): Promise<AuthUser | null> {
    const { rows } = await this.db.query<{ id: string; email: string }>(
      'SELECT id, email FROM users WHERE id = $1',
      [id],
    );
    if (rows.length === 0) return null;
    return { id: rows[0].id, email: rows[0].email };
  }
}
