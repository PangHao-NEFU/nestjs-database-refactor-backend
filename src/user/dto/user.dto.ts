interface UserDto {     //这可能是个User的子集,因为id属性是自增的
  username: string;
  password: string;
}

interface UserQuery {
  page: number;
  limit?: number;
  username?: string;
  role?: number;
  gender?: number;
}
export { UserQuery, UserDto };