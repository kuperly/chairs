import { dataSource, getDataSource } from './data-source';

export { dataSource, getDataSource };

// Helper to get repository
export async function getRepository<T>(entity: any) {
  const ds = await getDataSource();
  return ds.getRepository<T>(entity);
}
