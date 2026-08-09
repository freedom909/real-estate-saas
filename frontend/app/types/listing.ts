export type Picture = {
  id: string;
  listingId: string;
  objectKey: string;
  url: string;
  mimeType: string;
  size: number;
  type: string;
  sortOrder: number;
};


export type Listing = {
  id:string;

  title:string;

  description:string;

  address:string;

  price:number;

  pictures: Picture[];

  numOfBeds:number;

  numOfCustomers:number;

  isFeatured:boolean;
};
