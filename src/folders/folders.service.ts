import { FolderDto, FolderResponseDto } from '@/dto/folder.dto';
import { Folder } from '@/entities/folder.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
  ) {}

  async createFolder(body: FolderDto): Promise<FolderResponseDto> {
    const folder = this.folderRepository.create(body);
    if (body.parentId) {
      const parent = await this.folderRepository.findOne({
        where: { id: body.parentId },
      });

      if (!parent) {
        throw new HttpException({ message: 'Parent folder not found' }, 404);
      }

      folder.parent = parent;
    }

    await this.folderRepository.save(folder);

    return folder;
  }

  async deleteFolder(id: string): Promise<{ message: string }> {
    const folder = await this.folderRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!folder) {
      throw new HttpException({ message: 'Folder not found' }, 404);
    }

    if (folder.children?.length > 0) {
      throw new HttpException({ message: 'Folder has children' }, 400);
    }

    await this.folderRepository.remove(folder);
    return { message: 'Folder deleted' };
  }

  async getFullTree(): Promise<FolderResponseDto[]> {
    const folders = await this.folderRepository.query(`
      WITH RECURSIVE folder_tree AS (
        SELECT 
          id, 
          name, 
          "parentId", 
          "createdAt",
          1 AS level
        FROM folder
        WHERE "parentId" IS NULL
        
        UNION ALL
        
        SELECT 
          f.id, 
          f.name, 
          f."parentId", 
          f."createdAt",
          ft.level + 1
        FROM folder f
        INNER JOIN folder_tree ft ON ft.id = f."parentId"
      )
      SELECT * FROM folder_tree
      ORDER BY level, name
    `);

    return this.buildNestedTree(folders);
  }

  async getDirectChildren(
    parentId: string,
    page = 1,
    limit = 10,
  ): Promise<FolderResponseDto[]> {
    return this.folderRepository.find({
      where: { parent: { id: parentId } },
      relations: ['parent'],
      order: { name: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  private buildNestedTree(
    flatFolders: FolderResponseDto[],
  ): FolderResponseDto[] {
    const map = new Map<string, FolderResponseDto>();
    const roots: FolderResponseDto[] = [];

    flatFolders.forEach((flatFolder) => {
      const node: FolderResponseDto = {
        id: flatFolder.id,
        name: flatFolder.name,
        parentId: flatFolder.parentId,
        createdAt: flatFolder.createdAt,
        children: [],
      };
      map.set(node.id, node);

      if (!flatFolder.parentId) {
        roots.push(node);
      } else {
        const parent = map.get(flatFolder.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      }
    });

    return roots;
  }

  async search(name: string): Promise<FolderResponseDto[]> {
    const query = this.folderRepository
      .createQueryBuilder('folder')
      .where('LOWER(folder.name) LIKE LOWER(:name)', { name: `%${name}%` });

    return query.getMany();
  }
}
