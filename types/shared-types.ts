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

export type Book = {
  id: number;
  title: string;
  subtitle: string;
  book_desc: string;
  image_url: string;
  isbn: string;
  publisher: number;
  published_date: Date;
  page_count: number;
  available_as_epub: boolean;
  available_as_pdf: boolean;
  created_at: Date;
  updated_at: Date;
};

export type Author = {
  id: number;
  author_name: string;
  created_at: Date;
  updated_at: Date;
};

export type Genre = {
  id: number;
  genre_name: string;
  created_at: Date;
  updated_at: Date;
};
