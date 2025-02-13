import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class FolderDto {
  @ApiProperty({ example: 'folder1' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ default: null })
  @IsOptional()
  @IsString()
  parentId?: string | null;
}

export class FolderResponseDto {
  @IsUUID()
  id: string;
  name: string;
  parentId?: string | null;
  createdAt: Date;
  children?: FolderResponseDto[];
}
