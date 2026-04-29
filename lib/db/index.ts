import { ObjectLiteral, EntityTarget, Repository } from 'typeorm';
import { dataSource, getDataSource } from './data-source';

export { dataSource, getDataSource };

// Helper to get repository
export async function getRepository<T extends ObjectLiteral>(
  entity: EntityTarget<T>
): Promise<Repository<T>> {
  const ds = await getDataSource();
  return ds.getRepository(entity);
}
