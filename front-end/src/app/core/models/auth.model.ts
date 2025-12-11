export interface ILoginData {
  email: string;
  password: string;
}
export interface ILoginRes {
  message: string;
  data: string;
}
export interface ITokenDecode {
  id: string;
  name: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}
