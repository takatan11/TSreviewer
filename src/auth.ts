import{createClientForRequest} from './db/server.js'

export async function getCurrentUser(c:any){
  const {data}=await createClientForRequest(c).auth.getUser();
  return data.user;
}//ログイン中のユーザーを返す。ログインしていなければnull
