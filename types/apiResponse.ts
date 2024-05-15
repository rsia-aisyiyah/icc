export type ResourcePagination = {
  data: any[],
  links: ResourcePaginationLinks,
  meta: ResourcePaginationMeta
}

type ResourcePaginationLinks = {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
};

export type ResourcePaginationMeta = {
  current_page: number;
  from: number;
  last_page: number;
  links: ResourcePaginationMetaLink[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

type ResourcePaginationMetaLink = {
  url: string | null;
  label: string;
  active: boolean;
};