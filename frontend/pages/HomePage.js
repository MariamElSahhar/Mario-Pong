import { Component } from "./components/Component.js";
import { isAuth } from "../../../js/clients/token-client.js";

export class HomePage extends Component {
	constructor() {
		super();
	}

	async connectedCallback() {
		await import("./components/navbar/Navbar.js");
		await import("./components/HomeContent.js");
		super.connectedCallback();
	}

	render() {
		if (isAuth()) {
			return `
				<navbar-component nav-active="home"></navbar-comfponent>
				<friends-sidebar-component main-component="home-content-component"></friends-sidebar-component>
			`;
		} else {
			return `
				<navbar-component nav-active="home"></navbar-component>
				<home-content></home-content>
			`;
		}
	}
}

customElements.define("home-page", HomePage);
