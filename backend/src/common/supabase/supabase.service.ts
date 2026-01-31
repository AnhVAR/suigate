import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  private encryptionKey: string;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('supabase.url');
    const key = this.configService.get<string>('supabase.serviceRoleKey');
    this.encryptionKey =
      this.configService.get<string>('encryption.key') ||
      'default-dev-key-32-chars-long!!';

    if (!url || !key) {
      this.logger.warn(
        'Supabase URL/Key not configured - using mock mode for development',
      );
      return;
    }

    this.supabase = createClient(url, key, {
      auth: { persistSession: false },
    });

    this.logger.log('Supabase client initialized');
  }

  getClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error(
        'Supabase client not initialized - check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
      );
    }
    return this.supabase;
  }

  // Encrypt sensitive data (bank account numbers)
  encrypt(plainText: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return `${iv.toString('base64')}:${encrypted}`;
  }

  // Decrypt sensitive data
  decrypt(encryptedText: string): string {
    const [ivBase64, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivBase64, 'base64');
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
