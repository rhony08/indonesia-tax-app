import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('google.clientId', ''),
      clientSecret: configService.get<string>('google.clientSecret', ''),
      callbackURL: configService.get<string>('google.callbackUrl', ''),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, displayName, emails, photos } = profile;
    const user = await this.authService.validateGoogleUser({
      googleId: id,
      email: emails?.[0]?.value ?? '',
      name: displayName,
      avatarUrl: photos?.[0]?.value,
    });
    done(null, user);
  }
}
