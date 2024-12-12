import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class NewFlagRequestDto {
  @IsArray({ each: true })
  flag_name: string[];

  @IsOptional()
  @IsBoolean()
  status: boolean;
}

export class FindFlagRequestDto {
  @IsOptional()
  @IsBoolean()
  status: boolean;

  @IsString()
  flag_name: string;
}

export class AssignFlagRequestDto {
  @IsArray({ each: true })
  flag_ids: number[];

  @IsNumber()
  persona_id: number;
}
