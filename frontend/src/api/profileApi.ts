import protectedApi from "./protectedApi";

export interface ProfileInfoType {
  full_name: string;
  email: string;
  phone_number: string | null;
  avatar_url: string;
  address: string | null;
}

export const fetchUserInfo = async (): Promise<ProfileInfoType> => {
  const res = await protectedApi.get("/api/profile-info");
  return res.data.userInfo;
};

export const updateFullName = async (value: string) => {
  const res = await protectedApi.patch("/api/profile-info/full-name", {
    full_name: value,
  });
  return res.data.userInfo as Partial<ProfileInfoType>;
};

export const updateEmail = async (value: string) => {
  const res = await protectedApi.patch("/api/profile-info/email", {
    email: value,
  });
  return res.data.userInfo as Partial<ProfileInfoType>;
};

export const updatePhoneNumber = async (value: string) => {
  const res = await protectedApi.patch("/api/profile-info/phone-number", {
    phone_number: value,
  });
  return res.data.userInfo as Partial<ProfileInfoType>;
};

export const updateAddress = async (value: string) => {
  const res = await protectedApi.patch("/api/profile-info/address", {
    address: value,
  });
  return res.data.userInfo as Partial<ProfileInfoType>;
};
