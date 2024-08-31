/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
"use client";
import React, { useEffect } from "react";
import styles from "./Captcha.module.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Captcha: React.FC = () => {
	const router = useRouter();
	useEffect(() => {
		let gameStarted = false;
		// let hint = 0;
		// const hinttext = document.getElementById("hint")!;
		const captcha = document.getElementById("recaptcha")!;
		const lole = document.getElementById("lol")!;
		const checkbox = document.getElementById("cap-check")!;
		const loading = document.getElementById("cap-load")!;
		const gameWindow = document.getElementById("cap-game")!;
		const verf = document.getElementById("verify-btn")!;
		const canvas = document.getElementById("game")! as HTMLCanvasElement;
		const ctx = canvas.getContext("2d")!;

		let cardState = 0;
		let cardBackState = 0;
		let holdingCard = false;
		let pointerDownX = 0;
		let cardX = 0;
		let x: number, y;
		let result = 0;
		let slowBuffer = 0;

		const taskImg = new Image();
		taskImg.src = "/assets/auth/amogus_task.png";
		const walletImg = new Image();
		walletImg.src = "/assets/auth/amogus_wallet.png";
		const cardImg = new Image();
		cardImg.src = "/assets/auth/amogus_card.png";
		const readerImg = new Image();
		readerImg.src = "/assets/auth/reader.png";
		const readerImgR = new Image();
		readerImgR.src = "/assets/auth/reader-red.png";
		const readerImgG = new Image();
		readerImgG.src = "/assets/auth/reader-green.png";

		let currentReader = readerImg;
		let readerText = "Please insert card";

		const failAudio = new Audio("/assets/auth/susfail.mp3");
		const resultTexts = [
			"Too slow. Try again.",
			"Accepted. Thank you",
			"Too fast. Try again",
			"Bad read. Try again",
		];

		function animateHint() {
			if (gameStarted) return;
			// if (hint > 30) {
			// 	hinttext.style.opacity = hint % 2 === 0 ? "1" : "0";
			// }
			// hint += 1;
		}

		function stopAnimating() {
			// hinttext.style.opacity = "0";
			gameStarted = true;
		}

		function addLs() {
			if (lole.innerText.length > 15) {
				captcha.style.display = "flex";
				lole.style.display = "none";
				return;
			}
			lole.innerText = "l" + lole.innerText + "l";
			setTimeout(addLs, 20);
		}

		function lol() {
			addLs();
			lole.style.opacity = "0";
			stopAnimating();
		}

		function runCaptcha() {
			checkbox.style.borderRadius = "20px";
			checkbox.style.opacity = "0";
			checkbox.style.width = "10px";
			checkbox.style.height = "10px";
			setTimeout(loadAnim, 400);
		}

		function loadAnim() {
			checkbox.style.display = "none";
			loading.style.display = "block";
			setTimeout(() => {
				loading.style.borderTop = "5px solid #3498dbd3";
			}, 10);
			setTimeout(loadGame, 2000);
		}

		function loadGame() {
			checkbox.style.display = "block";
			loading.style.opacity = "0";
			setTimeout(() => {
				checkbox.style.borderRadius = "2px";
				checkbox.style.opacity = "1";
				checkbox.style.width = "28px";
				checkbox.style.height = "28px";
				loading.style.display = "none";
			}, 10);
			setTimeout(() => {
				gameWindow.style.display = "block";
			}, 1000);
		}

		function verify() {
			toast.info("Invalid captcha.", {
				description: "Please complete the captcha to continue.",
			});
			verf.innerText = verf.innerText === "SUS" ? "AMOGUS" : "SUS";
		}

		function interpolate(initial: number, desired: number, i: number) {
			return initial + (desired - initial) * i;
		}

		function uniClick(pageX: number, pageY: number) {
			x = pageX - window.innerWidth / 2 + 190;
			y = pageY - (window.innerHeight / 2 - 220);
			if (x > 27 && x < 181 && y > 319 && y < 405) {
				cardState = 0.01;
			} else if (cardState >= 1) {
				if (y > 155 && y < 201) {
					pointerDownX = x;
					holdingCard = true;
				}
			}
		}

		function mouseUp() {
			if (holdingCard && cardX < 231) {
				cardBackState = 0.01;
				readerText = "Bad read.  Try again.";
				failAudio.play();
				currentReader = readerImgR;
			}
			holdingCard = false;
		}

		function render(timestamp: number) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(taskImg, 0, 0, 932, 932, 0, 0, canvas.width, canvas.height);
			if (cardBackState > 0) {
				ctx.drawImage(
					cardImg,
					0,
					0,
					206,
					125,
					interpolate(cardX, 30, cardBackState),
					interpolate(100, 310, cardBackState),
					154,
					93
				);
				cardBackState *= 1.3;
				cardBackState = Math.min(1.01, cardBackState);
				if (cardBackState > 1) {
					if (result === 0) {
						// alert("yes");
						toast.promise(
							new Promise<void>((resolve) => {
								setTimeout(() => {
									router.push(
										// was a r34 :sob:
										"https://www.digitaltrends.com/wp-content/uploads/2022/06/among-us-red-crewmate.jpg?resize=1200%2C630&p=1"
									);
									resolve();
								}, 2000);
							}),
							{
								loading: "Connecting to the hacker server...",
								description: "You are now authorized to access the dashboard.",
							}
						);

						return;
					}
					cardBackState = 0;
					cardState = 0;
					cardX = 0;
				}
				ctx.drawImage(
					walletImg,
					0,
					0,
					932,
					932,
					0,
					0,
					canvas.width,
					canvas.height
				);
				ctx.drawImage(
					currentReader,
					0,
					0,
					932,
					932,
					0,
					0,
					canvas.width,
					canvas.height
				);
				ctx.font = "18px Reader";
				ctx.fillStyle = "#ffffff";
				ctx.fillText(readerText, 38, 37);
				requestAnimationFrame(render);
				return;
			}
			if (cardState >= 0 && cardState <= 1) {
				ctx.drawImage(
					cardImg,
					0,
					0,
					206,
					125,
					interpolate(30, 5, cardState),
					interpolate(310, 100, cardState),
					154,
					93
				);
				cardState *= 1.3;
			} else {
				if (holdingCard) {
					const deltaX = x - pointerDownX - cardX;
					if (deltaX < 0) result = 2;
					if (deltaX > 0 && deltaX < 4) slowBuffer += 1;
					if (deltaX > 10) result = 1;
					if (slowBuffer > 2) result = -1;
					cardX = x - pointerDownX;
					if (cardX >= 232) {
						cardX = 232;
						holdingCard = false;
						cardBackState = 0.01;
						if (result === 0) result = 2;
						failAudio.play();
						currentReader = result === 0 ? readerImgG : readerImgR;
						readerText = resultTexts[1 + result];
						setTimeout(() => {
							currentReader = readerImg;
							readerText = "Please insert card";
							result = 0;
							slowBuffer = 0;
						}, 800);
					}
				}
				if (cardState > 1 && (cardBackState > 1 || cardBackState === 0)) {
					readerText = "Please swipe card";
					currentReader = cardX === 0 ? readerImgG : readerImg;
				}
				ctx.drawImage(cardImg, 0, 0, 206, 125, cardX, 100, 154, 93);
			}
			ctx.drawImage(
				walletImg,
				0,
				0,
				932,
				932,
				0,
				0,
				canvas.width,
				canvas.height
			);
			ctx.drawImage(
				currentReader,
				0,
				0,
				932,
				932,
				0,
				0,
				canvas.width,
				canvas.height
			);
			ctx.font = "18px Reader";
			ctx.fillStyle = "#ffffff";
			ctx.fillText(readerText, 38, 37);
			requestAnimationFrame(render);
		}

		canvas.addEventListener("pointerdown", (e) => uniClick(e.pageX, e.pageY));
		canvas.addEventListener("touchstart", (e) => {
			const t = e.touches[0];
			uniClick(t.pageX, t.pageY);
		});
		canvas.addEventListener("touchmove", (e) => {
			const t = e.touches[0];
			x = t.pageX - window.innerWidth / 2 + 190;
			y = t.pageY - (window.innerHeight / 2 - 220);
		});
		canvas.addEventListener("pointermove", (e) => {
			x = e.pageX - window.innerWidth / 2 + 190;
			y = e.pageY - (window.innerHeight / 2 - 220);
		});
		canvas.addEventListener("touchend", mouseUp);
		canvas.addEventListener("pointerup", mouseUp);
		requestAnimationFrame(render);

		setInterval(animateHint, 250);

		// Expose functions to global scope
		(window as any).lol = lol;
		(window as any).runCaptcha = runCaptcha;
		(window as any).verify = verify;
	}, []);

	return (
		<div className={styles.container}>
			{/* <h3 id="lol" onClick={() => (window as any).lol()}>
				<u>Verify</u>
			</h3> */}
			<div className={styles.cContainer} id="recaptcha">
				<div className={styles.cContent}>
					<div
						className={styles.cCheckboxContainer}
						onClick={() => {
							(window as any).runCaptcha();
							// (window as any).stopAnimating();
						}}
					>
						<div id="cap-check" className={styles.cCheckbox}></div>
						<div id="cap-load" className={styles.cLoading}></div>
					</div>
					<label className={styles.cText}> I&apos;m not an impostor </label>
				</div>
				<div className={styles.cLogo}>
					<img
						className={styles.cLogoImg}
						src="/assets/auth/logo.png"
						width="42px"
					/>
					<label className={styles.cLogoText}>crewCAPTCHA</label>
				</div>
			</div>
			<div className={styles.game} id="cap-game">
				<div className={styles.gameHeader}>
					<label className={styles.gameHeaderText}>
						Prove that you are a crewmate
					</label>
					<label
						className={styles.gameHeaderText}
						style={{ fontWeight: 600, fontSize: 32 }}
					>
						Swipe the card
					</label>
				</div>
				<div className={styles.gameCanvas}>
					<canvas id="game" width="390px" height="440px"></canvas>
				</div>
				<div className={styles.gameFooter}>
					<img src="/assets/auth/amongus.png" width="40px" />
					<div
						id="verify-btn"
						className={styles.gameFooterButton}
						onClick={() => (window as any).verify()}
					>
						VERIFY
					</div>
				</div>
			</div>
		</div>
	);
};

export default Captcha;
