export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

export type Author = {
  id: number;
  name: string;
  bio: string;
  created_at: Date;
  updated_at: Date;
};

export type Book = {
  id: number;
  title: string;
  isbn: string;
  pub_year: number;
  quantity: number;
  price: number;
  created_at: Date;
  updated_at: Date;
};

export type Genre = {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
};
