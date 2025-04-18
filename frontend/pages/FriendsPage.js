import { Component } from "./Component.js";
import {
	fetchFriends,
	removeFriend,
} from "../scripts/clients/friends-client.js";
import { getUserSessionData } from "../scripts/utils/session-manager.js";
import { isAuth } from "../scripts/utils/session-manager.js";
import { showError } from "./error/ErrorPage.js";

export class FriendsPage extends Component {
	constructor() {
		super();
		this.friends = [];
		this.user_id = getUserSessionData().userid;
	}

	async connectedCallback() {
		await this.fetchFriends(this.user_id);
		super.connectedCallback();
	}

	render() {
		return `
			<div class="p-3 d-flex flex-row justify-content-end w-100">
				<div class="d-flex align-items-end">
					<small>${this.friends.length} Total Friends</small>
				</div>
			</div>
			<div id="friends-list" class="p-3 d-flex w-100 flex-wrap column-gap-5 row-gap-2"></div>
		`;
	}

	async postRender() {
		const friendsList = this.querySelector("#friends-list");
		friendsList.innerHTML = "";
		if (this.friends.length == 0) {
			friendsList.innerHTML = `
			<div class="d-flex flex-column justify-content-start align-items-center w-100">
				<p class="text-dark">No friends yet :(</p>
				<p class="text-dark">Try searching for users in the search bar</p>
			</div>
			`;
		} else {
			this.friends.forEach((friend) => {
				const friendCard = document.createElement("div");
				friendCard.innerHTML = this.renderFriendCard(friend);
				friendsList.appendChild(friendCard);

				super.addComponentEventListener(
					friendCard.querySelector(".user-info"),
					"click",
					() => {
						window.redirect(`/dashboard/${friend.id}`);
					}
				);
				super.addComponentEventListener(
					friendCard.querySelector(".remove-friend"),
					"click",
					async () => {
						await this.removeFriend(friend.id);
						await this.fetchFriends();
						this.attributeChangedCallback();
					}
				);
			});
		}
	}

	style() {
		return `
		<style>
			#friend-profile-img {
				max-width: 44px;
				max-height: auto;
			}
			.friend-card {
				min-width: 200px;
				width: 400px;
				height: 60px;
			}
		</style>
		`;
	}

	renderFriendCard({ id, username, avatar, is_online }) {
		return `
		<div class="friend-card p-2 d-flex flex-row h-60px p-auto justify-content-between bg-light rounded">
			<div role="button" class="user-info d-flex flex-row align-items-center gap-3">
				<img src="${avatar}/" class="h-100 rounded-circle" id="friend-profile-img"/>
				<div>
					<h4 class="m-0 link-dark">${username}</h4>
					<small class="m-0 link-dark">${is_online ? "Online" : "Offline"}</small>
				</div>
			</div>
			<p role="button" class="remove-friend p-1 link-danger">X</p>
		</div>
		`;
	}

	async removeFriend(friend_id) {
		if (!(await isAuth())) window.redirect("/");
		const { success, data, error } = await removeFriend(
			this.user_id,
			friend_id
		);
		if (!success) {
			showError();
			console.error("Failed to remove friend:", error);
		}
	}

	async fetchFriends() {
		const { success, data, error } = await fetchFriends(this.user_id);
		if (success) {
			this.friends = data;
		} else {
			showError();
			console.error("Failed to fetch friends:", error);
		}

		// Dummy friends data
		// this.friends = [
		// 	{
		// 		id: 33,
		// 		username: "mariam",
		// 		avatar: "http://127.0.0.1:8000/media/images/default.jpg",
		// 		is_online: true,
		// 		last_seen: "2024-11-12T22:13:17.193941Z",
		// 	},
		// 	{
		// 		id: 33,
		// 		username: "mariam",
		// 		avatar: "http://127.0.0.1:8000/media/images/default.jpg",
		// 		is_online: true,
		// 		last_seen: "2024-11-12T22:13:17.193941Z",
		// 	},
		// 	{
		// 		id: 33,
		// 		username: "mariam",
		// 		avatar: "http://127.0.0.1:8000/media/images/default.jpg",
		// 		is_online: true,
		// 		last_seen: "2024-11-12T22:13:17.193941Z",
		// 	},
		// ];
	}
}

customElements.define("friends-page", FriendsPage);
