import { IsString, IsNotEmpty } from 'class-validator';

export class StartAuthorizationDto {
  @IsString()
  @IsNotEmpty()
  bankCode: string;
}
