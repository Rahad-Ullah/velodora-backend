export type IPaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type IPaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPage: number;
};