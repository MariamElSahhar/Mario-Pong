// UserProfilePage.js
import { Component } from "../Component.js";
import { fetchUserById } from "../../js/clients/users-client.js";
import { fetchUserGameLog } from "../../js/clients/gamelog-client.js";
import { getUserSessionData } from "../../js/utils/session-manager.js";

export class UserProfilePage extends Component {
	constructor() {
		super();
		this.stats = {};
		this.gamelog = {};
		this.userid = window.location.pathname.startsWith("/profile/")
			? window.location.pathname
					.replace("/profile/", "")
					.replace(/\/+$/, "")
			: getUserSessionData().userid;
	}

	async connectedCallback() {
		await import("../navbar/Navbar.js");
		await import("../buttons/FriendsButton.js");
		await import("./components/GameLogTable.js");
		await import("./components/GameStatsCard.js");
		await import("./components/GameHeatMap.js");

		super.connectedCallback();

		await this.getGameLog().then(() => {
			console.log("rendering data");
			this.querySelector("gamelog-table").renderGameLog(this.gamelog);
			this.querySelector("game-stats").renderGameStats(this.stats);
			this.querySelector("game-heatmap").renderGameHeatMap(
				this.gamelog,
				this.stats
			);
		});
	}

	render() {
		return `
            <div class="profile-page container d-flex flex-column gap-3 my-3">
                <div class="profile-content d-flex w-100 row-gap-5">
                    <div class="profile-main-content d-flex flex-column w-100 gap-3">
						<div class="graphs d-flex w-100 column-gap-2">
							<game-stats class="flex-fill h-100 rounded"></game-stats>
							<game-heatmap class="game-heatmap flex-fill h-100 rounded"></game-heatmap>
						</div>
                        <gamelog-table class=""></gamelog-table>
                    </div>
                </div>
            </div>
        `;
	}

	style() {
		return `
			<style>
				.graphs {
					flex-direction: column;
				}
				.game-heatmap {
					width: 100%;
				}
				@media (min-width: 992px) {
					.graphs {
						flex-direction: row;
					}
					.game-heatmap {
						width: 50%;
					}
				}
			</style>
		`;
	}

	async getGameLog() {
		const { success, data } = await fetchUserGameLog(this.userid);
		if (!success) {
			console.log("Error fetching gamelog");
			return;
		}
		this.gamelog = data;
		const localPlayed = this.gamelog.local.length;
		const remotePlayed = this.gamelog.remote.length;
		const tttPlayed = this.gamelog.ttt.length;

		const remoteWon = this.gamelog.remote.filter(
			(item) => item.is_win === true
		).length;
		const localWon = this.gamelog.local.filter(
			(item) => item.is_win === true
		).length;
		const tttWon = this.gamelog.ttt.filter(
			(item) => item.is_win === true
		).length;
		const totalPlayed = localPlayed + remotePlayed + tttPlayed;
		const totalWon = localWon + tttWon + remoteWon;
		this.stats = {
			localPlayed,
			localWon,
			remotePlayed,
			remoteWon,
			tttPlayed,
			tttWon,
			totalPlayed,
			totalWon,
		};
	}
}

customElements.define("user-profile-page", UserProfilePage);
