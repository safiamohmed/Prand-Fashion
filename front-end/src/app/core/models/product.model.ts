// models/product.model.ts
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
}

export interface ISubCategory {
  _id: string;
  name: string;
  slug: string;
  parent?: string | ICategory;
}

export interface IProduct {
  _id?: string;
  name: string;
  price: number;
  slug: string;
  desc: string;
  stock: number;
  imgURL: string;
  category?: string | ICategory ;
  subCategory?: string | ISubCategory;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductsResponse {
  message: string;
  data: IProduct[];
}

export interface IProductResponse {
  message: string;
  data: IProduct;
}
