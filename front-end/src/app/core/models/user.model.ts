export interface IUser {
  name:string;
  role:string;
  email: string;
    createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserResponse {
  message : string ;
  data : IUser[];
}
export interface IUpdateUserData {
  name?: string;
  email?: string;
}

export interface IUpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
