import { Component } from "./Component.js";
import { Footer } from "../layouts/components/Footer.js";

export class LandingPage extends Component {
	constructor() {
		super();
	}

	render() {
		return `
			<div class="d-flex flex-column h-100 w-100 justify-content-center align-items-center gap-3">
				<img class="title-img z-1 w-50" src="/assets/titlepage.webp" alt="Welcome to Pong!"/>
				<div class="d-flex flex-column justify-content-center align-items-center gap-2 w-100">
					<button id="login-button" class="btn z-3 w-25">Log In</button>
					<button id="sign-up-button" class="btn z-3 w-25">Sign Up</button>
				</div>
			</div>
		`;
	}

	style() {
		return `
			<style>
				.title-img {
					animation: jump 4s ease-in-out infinite;
				}
			</style>
		`;
	}

	postRender() {
		const loginButton = document.querySelector("#login-button");
		const signupButton = document.querySelector("#sign-up-button");
		const plant = document.querySelector("#plant");
		const shroom = document.querySelector("#shroom");
		plant.style.bottom = "6em";
		shroom.style.bottom = "6em";

		super.addComponentEventListener(loginButton, "click", () => {
			window.redirect("/login");
		});
		super.addComponentEventListener(signupButton, "click", () => {
			window.redirect("/sign-up");
		});
		super.addComponentEventListener(loginButton, "mouseenter", () => {
			plant.style.bottom = "12em";
		});
		super.addComponentEventListener(loginButton, "mouseleave", () => {
			plant.style.bottom = "6em";
		});
		super.addComponentEventListener(signupButton, "mouseenter", () => {
			shroom.style.bottom = "12em";
		});
		super.addComponentEventListener(signupButton, "mouseleave", () => {
			shroom.style.bottom = "6em";
		});
	}
}

customElements.define("landing-page", LandingPage);
