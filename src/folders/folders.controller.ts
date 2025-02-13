import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { FolderDto, FolderResponseDto } from '@/dto/folder.dto';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  async createFolder(@Body() body: FolderDto): Promise<FolderResponseDto> {
    return this.foldersService.createFolder(body);
  }

  @Delete(':id')
  async deleteFolder(@Param('id') id: string) {
    return this.foldersService.deleteFolder(id);
  }

  @Get('tree')
  async getFullTree(): Promise<FolderResponseDto[]> {
    return this.foldersService.getFullTree();
  }

  @Get(':id/children')
  async getChildren(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 100,
  ): Promise<FolderResponseDto[]> {
    return this.foldersService.getDirectChildren(id, page, limit);
  }

  @Post('search')
  async search(@Body() body: { name: string }): Promise<FolderResponseDto[]> {
    return this.foldersService.search(body.name);
  }
}
