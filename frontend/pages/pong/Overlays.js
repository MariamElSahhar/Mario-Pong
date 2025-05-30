export function renderOverlay(container) {
	const overlay = document.createElement("div");
	overlay.id = "game-overlay";
	overlay.classList.add(
		"position-fixed",
		"top-0",
		"start-0",
		"w-100",
		"h-100",
		"d-flex",
		"justify-content-center",
		"align-items-center",
		"bg-dark",
		"bg-opacity-75",
		"text-white"
	);
	overlay.style.zIndex = "9999";
	container.appendChild(overlay);
	return overlay;
}

export function removeOverlay(overlay) {
	if (overlay) {
		overlay.remove();
	}
	return null;
}

export function renderPreGameCard(
	component,
	container,
	player1,
	player2,
	engine,
	match = undefined
) {
	const overlay = renderOverlay(container);
	let countDownOverlay, countDownIntervalId;
	overlay.innerHTML = `
	  <div class="card text-center">
		<div class="card-body">
			${
				match != undefined
					? `<p>${
							match < 2
								? `Round 1 - Match ${match + 1}`
								: `Final Round`
					  }</p>`
					: ""
			}
			<div class="d-flex justify-content-between align-items-center w-75">
			${window.icons.mario()} <h2>${player1} vs ${player2}</h2> ${window.icons.luigi(
		true
	)}
			</div>
			<button id="start-game" class="btn w-100">Go!</button>
		</div>
	  </div>
	</div>

	`;
	component.addComponentEventListener(
		document.querySelector("#start-game"),
		"click",
		() => {
			removeOverlay(overlay);
			({ countDownOverlay, countDownIntervalId } = renderCountdownCard(
				container,
				engine
			));
		}
	);
	return { countDownOverlay, countDownIntervalId };
}

export function renderCountdownCard(container, engine) {
	const startDateInSeconds = Date.now() / 1000 + 3;
	let secondsLeft = Math.round(startDateInSeconds - Date.now() / 1000);
	const overlay = renderOverlay(container);
	overlay.innerHTML = `
		<h1 id="countdown" class="display-1 fw-bold">5</h1>
	`;
	overlay.querySelector("#countdown").textContent = secondsLeft;
	const countDownIntervalId = setInterval(() => {
		secondsLeft -= 1;
		overlay.querySelector("#countdown").textContent = secondsLeft;

		if (secondsLeft <= 0) {
			clearInterval(countDownIntervalId);
			engine.startGame();
			removeOverlay(overlay);
		}
	}, 1000);
	return { overlay, countDownIntervalId };
}

export function renderEndGameCard(
	component,
	playerNames,
	playerScores,
	tournament = false
) {
	const overlay = renderOverlay(component.container);
	const isDraw = playerScores[0] === playerScores[1];
	const winnerIsPlayer = playerScores[0] > playerScores[1];
	const winnerName = winnerIsPlayer ? playerNames[0] : playerNames[1];

	overlay.innerHTML = `
		<div id="end-game-card" class="card">
			<div class="card-body">
				<img class="my-2" id="winner-sprite" src="/assets/sprites/${
					winnerIsPlayer ? "mario" : "luigi"
				}.webp"/>
				<h3 class="card-subtitle mb-2">${
					isDraw ? `It's a Draw!` : `${winnerName} Wins!`
				}</h3>
				<div class="d-flex w-100 gap-3">
					<div class="w-100">
						<p class="text-truncate text-end mb-0">${playerNames[0]}</p>
						<p class="display-6 text-end">${playerScores[0]}</p>
					</div>
					<div class="w-100">
						<p class="text-truncate text-start mb-0">${playerNames[1]}</p>
						<p class="display-6 text-start">${playerScores[1]}</p>
					</div>
				</div>
				<!-- CTAs -->
				${
					tournament
						? `<button id="next-match" class="btn btn-primary mt-3">Next Match</button>`
						: `<div class="d-flex w-100 gap-2">
					<button class="btn btn-secondary w-100" onclick="window.redirect('/home')">Go Home</button>
					<button class="btn btn-primary w-100" onclick="window.redirect('${window.location.pathname}')">Play Again</button>
				</div>`
				}
			</div>
		</div>
	`;

	if (tournament) {
		component.addComponentEventListener(
			document.querySelector("#next-match"),
			"click",
			() => {
				removeOverlay(overlay);
				component.startNextMatch();
			}
		);
	}
	return overlay;
}

export function renderTournamentResults(component, rankedPlayers) {
	const overlay = renderOverlay(component.container);
	overlay.innerHTML = `
			<div class="card text-center bg-brick-100">
				<div class="card-body">
					<h1 class="fw-bold">Winners!</h1>
					<div id="podium-box" class=" w-100 row justify-content-center align-items-end">
						<div class="col-4 text-center pe-0 ps-0">
							<div class="fw-bold"><p class="fs-3">${rankedPlayers[1]}</p></div>
							<img src="/assets/second.webp" alt="Silver Medal" class="mb-2" width="60">
							<div id="second-step" class="h-25 bg-secondary text-white fw-bold fs-1 d-flex align-items-center justify-content-center">2</div>
						</div>
						<div class="col-4 text-center pe-0 ps-0 ">
							<div class="fw-bold"><p class="fs-3">${rankedPlayers[0]}</p></div>
							<img src="/assets/first.webp" alt="Silver Medal" class="mb-2" width="60">
							<div id="first-step " class="h-50 bg-secondary text-white fw-bold fs-1 d-flex align-items-center justify-content-center">1</div>
						</div>
						<div class="col-4 text-center pe-0 ps-0">
							<div class="fw-bold"><p class="fs-3">${rankedPlayers[2]}</p></div>
							<img src="/assets/third.webp" alt="Silver Medal" class="mb-2" width="60">
							<div id="third-step" class="h-25 bg-secondary text-white fw-bold fs-1 d-flex align-items-center justify-content-center">3</div>
						</div>
					</div>
					<div class="d-flex gap-2 mt-3 w-100">
						<button class="btn btn-secondary w-100" onclick="window.redirect('/home')">Go Home</button>
						<button class="btn btn-primary w-100" onclick="window.redirect('${window.location.pathname}')">Play Again</button>
					</div>
				</div>
			</div>
        `;
}

export function renderPlayerDisconnectedCard(component) {
	const overlay = renderOverlay(component.container);
	overlay.innerHTML = `
		<div id="end-game-card" class="card text-center bg-light">
			<div class="card-body">
				<h1 class="card-title">Oh no!</h1>
				<h5 class="card-subtitle mb-3">Your opponent has disconnected</h5>
				<div class="d-flex w-100 gap-2">
					<button class="btn btn-secondary w-100" onclick="window.redirect('/home')">Go Home</button>
					<button class="btn btn-primary w-100" onclick="window.redirect('${window.location.pathname}')">Play Again</button>
				</div>
			</div>
		</div>`;
}

export function renderOpponentFoundCard(component, player1, player2) {
	const overlay = renderOverlay(component.container);
	overlay.innerHTML = `
		<div class="card text-center">
		<div class="card-body">
			<div class="d-flex justify-content-between align-items-center w-75">
			${window.icons.mario()} <h2>${player1} vs ${player2}</h2> ${window.icons.luigi(
		true
	)}
			</div>
		</div>
	  </div>`;
}

export function renderWaitingForOpponent(component, onCancel) {
	const overlay = renderOverlay(component.container);
	overlay.innerHTML = `
		<div class="card text-center">
			<div class="card-body">
				<img id="search-icon" src="/assets/question.webp" class="h-auto"/>
				<h4 id="status">Waiting for an opponent</h4>
				<p id="timer">0:00</p>
				<button id="cancel-matchmaking" class="btn w-100">Cancel Matchmaking</button>
			</div>
		</div> `;

	const timerElement = overlay.querySelector("#timer");
	const startTime = Date.now();

	const updateTimer = () => {
		const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
		const minutes = Math.floor(elapsedSeconds / 60);
		const seconds = elapsedSeconds % 60;

		timerElement.textContent = `${minutes}:${seconds
			.toString()
			.padStart(2, "0")}`;

		requestAnimationFrame(updateTimer);
	};

	updateTimer();

	const cancelButton = overlay.querySelector("#cancel-matchmaking");
	if (cancelButton && typeof onCancel === "function") {
		cancelButton.addEventListener("click", function () {
			onCancel();
			removeOverlay(overlay);
		});
	}

	return overlay;
}
