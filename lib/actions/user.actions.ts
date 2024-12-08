"use server";

import { Query, ID } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";
import { cookies } from "next/headers"

/**
 * Fonction qui gère les erreurs
 * @param error 
 * @param message 
 */
const handleError = (error: unknown, message:string) => {
console.log(error, message);
throw error;
}

const getUserByEmail = async (email: string) => {
  const {databases} = await createAdminClient();

  const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.usersCollectionId, [Query.equal("email", [email])]);

  return result.total > 0 ? result.documents[0] : null;
}

export const sendEmailOTP = async ({email} : {email: string}) => {
  const {account} = await createAdminClient();

  try{
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  }
  catch(e){
   handleError(e, "Failed to send email OTP");
  }
}

export const createAccount = async ({fullName,email} : {fullName: string, email: string}) => {

  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({email});
  if(!accountId) throw new Error("Failed to send OTP");

  if(!existingUser){
    const {databases} = await createAdminClient();
    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar: 'https://www.milton.edu/wp-content/uploads/2019/11/avatar-placeholder-250x300.jpg',
        accountId,
      }
    )
  }
  return parseStringify({accountId});

}

export const verifySecret = async ({accountId, password} : {accountId: string, password: string}) => {
  try{
    const {account} = await createAdminClient();
    const session =  await account.createSession(accountId, password);
        (await cookies()).set('appwrite-session', session.secret, {
          path:'/',
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
        })
        return parseStringify({sessionId: session.$id});
  }
  catch(e){
    handleError(e, "Failed to verify OTP");
  }
}