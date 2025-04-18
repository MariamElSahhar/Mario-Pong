import { get, post, patch, del } from "../utils/http-requests.js";

const URIs = {
	myInfo: `/api/users/me`,
	users: `/api/users`,
	usersID: (id) => `/api/users/${id}/`,
	usersUsername: (username) => `/api/users/?username=${username}`,
	userAvatar: (id) => `/api/users/${id}/avatar/`,
};

// Fetch all users
export const fetchUsers = async () => {
	const url = URIs.users;
	const { status, body, error } = await get(url);
	if (error) return { success: false, data: null, error: error };
	return { success: true, data: body };
};

// Function user by ID
export const fetchUserById = async (id) => {
	const url = URIs.usersID(id);
	const { status, body, error } = await get(url);
	if (error) return { success: false, error: error };
	if (!body.exists)
		return { success: false, error: "User does not exist" };
	return { success: body.exists, data: body.data };
};

// Function user by ID
export const searchUsers = async (username) => {
	const url = URIs.usersUsername(username);
	const { status, body, error } = await get(url);
	if (error) return { success: false, data: null, error: error };
	return { success: true, body };
};

// Update existing user by id
export const updateUser = async (id, userData) => {
	const url = URIs.usersID(id);
	const { status, body, error } = await patch(url, userData);
	if (error) return { success: false, body: null, error: error };
	return { success: true, body };
};

// Update existing user by id
export const getMyInfo = async () => {
	const url = URIs.myInfo;
	const { status, body, error } = await get(url);
	if (error) return { success: false, body: null, error: error };
	return { success: true, body: body.data };
};

// Delete user
export const deleteUser = async (id) => {
	const url = URIs.usersID(id);
	const { status, body, error } = await del(url);
	if (error) return { success: false, error: error };
	return { success: true };
};

// Delete user avatar
export const deleteAvatar = async ({ user_id }) => {
	const url = URIs.userAvatar(user_id);
	const { status, body, error } = await del(url);
	if (error) return { success: false, data: null, error: error };
	return { success: true, data: body };
};

// Upload user avatar
export const uploadAvatar = async ({ avatar, user_id }) => {
	const url = URIs.userAvatar(user_id);
	const { status, body, error } = await post(url, { avatar, user_id });
	if (error) return { success: false, error: error };
	return { success: true, data: body };
};
