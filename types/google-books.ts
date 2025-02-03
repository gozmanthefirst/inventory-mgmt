export type GoogleBookVolume = {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    publisher: string;
    publishedDate: string;
    description?: string;
    industryIdentifiers: {
      type: "ISBN_10" | "ISBN_13";
      identifier: string;
    }[];
    pageCount: number;
    categories: string[];
    imageLinks?: {
      thumbnail?: string;
    };
  };
};

export type GoogleBookResponse = {
  items: GoogleBookVolume[];
  totalItems: number;
};
