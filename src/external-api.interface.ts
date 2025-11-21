export interface externalApiResponse {
  name?: {
    title?: string;
    first?: string;
    last?: string;
  };
  location?: {
    street?: {
      number?: number;
      name?: string;
    };
    city?: string;
    state?: string;
    country?: string;
    postcode?: number | string; // sometimes string
    coordinates?: {
      latitude?: number | string;
      longitude?: number | string;
    };
    timezone?: {
      offset?: string;
      description?: string;
    };
  };
  email?: number;
  dob?: {
    date?: string;
    age?: number;
  };
  phone?: string;
  cell?: string;
  picture?: {
    large?: string;
    medium?: string;
    thumbnail?: string;
  };
}

export interface finalResultType {
  name: string;
  location: string;
  email: string;
  age: number;
  phone: string;
  cell: string;
  picture: string[];
}
