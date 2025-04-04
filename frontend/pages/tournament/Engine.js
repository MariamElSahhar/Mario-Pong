import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.170.0/three.module.min.js";
import { ThreeJSUtils } from "../../scripts/game-utils/ThreeJSUtils.js";
import { KeyHandler } from "../../scripts/game-utils/KeyHandler.js";
import { Scene } from "./TournamentScene.js";
import { showError } from "../error/ErrorPage.js";

export class Engine {
	threeJS;
	#keyHookHandler;
	#scene;
	#component;
	#onMatchEndCallback;
	playerNames;

	constructor(component, playerNames, onMatchEndCallback) {
		this.gameSession = -1;
		this.#component = component;
		this.playerNames = playerNames;
		this.#onMatchEndCallback = onMatchEndCallback;
	}

	async renderScene() {
		if (!Array.isArray(this.playerNames) || this.playerNames.length < 2) {
			showError();
			console.error("Invalid player names:", this.playerNames);
			return;
		}

		if (!this.#component || !this.#component.container) {
			showError();
			console.error("Invalid component or container.");
			return;
		}
		if (this.threeJS) {
			this.threeJS.stopAnimationLoop();
			this.threeJS.disposeResourcesr();
			this.threeJS = null;
		}

		if (this.#scene) {
			this.clearScene(this.#scene.threeJSScene);
			this.#scene = null;
		}
		const container = this.#component.container;
		const canvas = container.querySelector("canvas");
		if (canvas) {
			container.removeChild(canvas);
		}

		this.threeJS = new ThreeJSUtils(this);
		this.#keyHookHandler = new KeyHandler(this);

		this.#scene = new Scene();
		await this.#scene.init(
			this,
			this.playerNames,
			this.#onMatchEndCallback
		);
		if (this.#scene) {
			this.#scene.updateCamera();
			this.displayGameScene();
		} else {
			showError();
			console.error("Scene initialization failed");
		}
	}

	startGame() {
		this.startListeningForKeyHooks();
		this.#scene.startGame();
	}

	cleanUp() {
		try {
			this.threeJS.stopAnimationLoop();
		} catch (err) {
			showError();
			console.error("Error stopping animation loop:", err);
		}
		try {
			if (this.#keyHookHandler) {
				this.#keyHookHandler.stopListeningForKeys();
			}
		} catch (err) {
			showError();
			console.error("Error stopping key hook handler:", err);
		}

		try {
			if (this.#scene) {
				this.clearScene(this.#scene.threeJSScene);
			}
		} catch (err) {
			showError();
			console.error("Error clearing the scene:", err);
		}
		try {
			if (this.threeJS) {
				this.threeJS.disposeResources();
			}
		} catch (err) {
			showError();
			console.error("Error clearing the renderer:", err);
		}
	}

	renderFrame() {
		this.threeJS.renderScene(this.#scene.threeJSScene);
	}

	get scene() {
		return this.#scene;
	}

	set scene(newScene) {
		this.clearScene(this.#scene.threeJSScene);
		this.#scene = newScene;
	}

	clearScene(scene) {
		while (scene.children.length > 0) {
			const child = scene.children[0];
			this.disposeObject(child);
			scene.remove(child);
		}
	}

	disposeObject(object) {
		if (!object) return;

		if (object.geometry) {
			object.geometry.dispose();
		}
		if (object.material) {
			if (Array.isArray(object.material)) {
				object.material.forEach((material) => {
					if (material.map) material.map.dispose();
					material.dispose();
				});
			} else {
				if (object.material.map) object.material.map.dispose();
				object.material.dispose();
			}
		}
		if (object.children) {
			for (let i = object.children.length - 1; i >= 0; i--) {
				this.disposeObject(object.children[i]);
			}
		}
	}

	displayGameScene() {
		const clock = new THREE.Clock();

		this.threeJS.beginAnimationLoop(() => {
			const currentTime = Date.now();
			const delta = clock.getDelta();
			this.scene.updateFrame(currentTime, delta);

			this.threeJS.controls.update();
			this.renderFrame();
		});
	}

	get component() {
		return this.#component;
	}

	get threeJS() {
		return this.threeJS;
	}

	updateCamera(cameraPosition, cameraLookAt) {
		this.threeJS.controls.target.set(
			cameraLookAt.x,
			cameraLookAt.y,
			cameraLookAt.z
		);
		this.threeJS.updateCameraPosition(cameraPosition);
		this.threeJS.updateCameraView(cameraLookAt);
	}

	resizeHandler() {
		if (this.#scene instanceof Scene) {
			this.#scene.updateCamera();
		}
	}

	startListeningForKeyHooks() {
		this.#keyHookHandler.listenForKeys();
	}

	getComponent() {
		if (!this.#component) {
			showError();
			console.error("Component is not defined.");
			return null;
		}
		return this.#component;
	}
}
