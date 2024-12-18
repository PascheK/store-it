"use server";

import { Query, ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";
import { cookies } from "next/headers"
import { avatarPlaceHolder } from "@/constants";
import { redirect } from "next/navigation";

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
        avatar: avatarPlaceHolder,
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
    console.log(session);
        (await cookies()).set('appwrite-session', session.secret, {
          path:'/',
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
        })
        return parseStringify({sessionId: session.$id});
  }
  catch(e){
    handleError(e, "Failed to create cookies");
  }
}

export const getCurrentUser = async () => {

  try{
    const { databases, account } = await createSessionClient();

    const result = await account.get();

    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", result.$id)],
    );
  
    if (user.total <= 0) return null;
  
    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error);
    return null;
  }
 
}

export const signOutUser = async () => {
  const { account } = await createSessionClient();

  try {
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in");
  }
};

export const signInUser = async ({email} : {email: string}) => {
  try{
    const existingUser = await getUserByEmail(email);
    if(existingUser){
      await sendEmailOTP({email});
      return parseStringify({accountId: existingUser.accountId})
    }
    return parseStringify({accountId: null, error: 'user not found !'})

  }catch(e){
    handleError(e, 'failed to sign in User! ');

  }

}