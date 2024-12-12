import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class NewPersonaRequestDto {
  @IsString()
  @Length(10)
  title: string;

  @IsString()
  @Length(20)
  prompt: string;

  @IsString()
  @Length(1)
  category: string;

  @IsString()
  @Length(1)
  subcategory: string;
}

export class UpdatePersonaRequestDto extends NewPersonaRequestDto {
  @IsOptional()
  @IsNotEmpty()
  persona_id: number;
}

export class FindPersonaRequestDto {
  @IsString()
  @IsOptional()
  @Length(10)
  title?: string;

  @IsString()
  @IsOptional()
  @Length(20)
  prompt?: string;

  @IsString()
  @IsOptional()
  @Length(1)
  category?: string;

  @IsString()
  @IsOptional()
  @Length(1)
  subcategory?: string;

  @IsNumber()
  @IsOptional()
  persona_id?: number;
}

export class AssignPersonaRequestDto {
  @IsNumber()
  persona_id: number;
  @IsNumber()
  user_id: number;
}
