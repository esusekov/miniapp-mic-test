import React from 'react';
import PropTypes from 'prop-types';

import { Panel, PanelHeader, Header, Button, Group, Cell, Div, Avatar } from '@vkontakte/vkui';
import styles from './Home.module.scss';

const useMicLogic = () => {
	const rootRef = React.useRef();

	React.useEffect(() => {
		const root = rootRef.current;
		console.log('root', root);
		var paths = root.getElementsByTagName('path');
		var visualizer = root.querySelector('#visualizer');
		var mask = visualizer.querySelector('#mask');
		var h = root.getElementsByTagName('h1')[0];
		var hSub = root.getElementsByTagName('h1')[1];
		var AudioContext;
		var audioContent;
		var start = false;
		var permission = false;
		var path;
		var seconds = 0;
		var loud_volume_threshold = 30;

		var soundAllowed = function (stream) {
			console.log('soundAllowed 0');
			permission = true;
			var audioStream = audioContent.createMediaStreamSource( stream );
			var analyser = audioContent.createAnalyser();
			var fftSize = 1024;

			analyser.fftSize = fftSize;
			audioStream.connect(analyser);

			var bufferLength = analyser.frequencyBinCount;
			var frequencyArray = new Uint8Array(bufferLength);

			visualizer.setAttribute('viewBox', '0 0 255 255');

			for (var i = 0 ; i < 255; i++) {
				path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				path.setAttribute('stroke-dasharray', '4,1');
				mask.appendChild(path);
			}
			var doDraw = function () {
				requestAnimationFrame(doDraw);
				if (start) {
					analyser.getByteFrequencyData(frequencyArray);
					var adjustedLength;
					for (var i = 0 ; i < 255; i++) {
						adjustedLength = Math.floor(frequencyArray[i]) - (Math.floor(frequencyArray[i]) % 5);
						paths[i].setAttribute('d', 'M '+ (i) +',255 l 0,-' + adjustedLength);
					}
				}
				else {
					for (var i = 0 ; i < 255; i++) {
						paths[i].setAttribute('d', 'M '+ (i) +',255 l 0,-' + 0);
					}
				}
			}
			var showVolume = function () {
				console.log('soundAllowed 1');
				setTimeout(showVolume, 500);
				if (start) {
					analyser.getByteFrequencyData(frequencyArray);
					console.log('soundAllowed 2');
					var total = 0
					for(var i = 0; i < 255; i++) {
						var x = frequencyArray[i];
						total += x * x;
					}
					var rms = Math.sqrt(total / bufferLength);
					var db = 20 * ( Math.log(rms) / Math.log(10) );
					db = Math.max(db, 0); // sanity check
					h.innerHTML = Math.floor(db) + " dB";

					if (db >= loud_volume_threshold) {
						seconds += 0.5;
						if (seconds >= 5) {
							hSub.innerHTML = "You’ve been in loud environment for<span> " + Math.floor(seconds) + " </span>seconds." ;
						}
					}
					else {
						seconds = 0;
						hSub.innerHTML = "";
					}
				}
				else {
					h.innerHTML = "";
					hSub.innerHTML = "";
				}
			}

			doDraw();
			showVolume();
		}

		var soundNotAllowed = function (error) {
			h.innerHTML = "You must allow your microphone.";
			console.log(error);
		}


		root.querySelector('#button').onclick = function () {
			if (start) {
				start = false;
				this.innerHTML = "Start Listen";
				this.className = styles.greenButton;
			}
			else {
				if (!permission) {
					navigator.mediaDevices.getUserMedia({audio:true})
						.then(soundAllowed)
						.catch(soundNotAllowed);

					AudioContext = window.AudioContext || window.webkitAudioContext;
					audioContent = new AudioContext();
				}
				start = true;
				this.innerHTML = "Stop Listen";
				this.className = styles.redButton;
			}
		};
	}, []);

	return { rootRef };
}

const Mic = () => {
	const { rootRef } = useMicLogic();

	return (
		<div className={styles.page} ref={rootRef}>
			<svg preserveAspectRatio="none" id="visualizer" version="1.1" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<mask id="mask">
						<g id="maskGroup" />
					</mask>
					<linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" style={{ stopColor: '#db6247', stopOpacity: 1 }} />
						<stop offset="40%" style={{ stopColor: '#f6e5d1', stopOpacity: 1 }} />
						<stop offset="60%" style={{ stopColor: '#5c79c7', stopOpacity: 1 }} />
						<stop offset="85%" style={{ stopColor: '#b758c0', stopOpacity: 1 }} />
						<stop offset="100%" style={{ stopColor: '#222', stopOpacity: 1 }} />
					</linearGradient>
				</defs>
				<rect x="0" y="0" width="100%" height="100%" fill="url(#gradient)" mask="url(#mask)" />
			</svg>

			<h1 className={styles.mainText}>Please allow the use of your microphone.</h1>

			<h1 className={styles.subText} />

			<div className={styles.buttonContainer}>
				<button id="button" className={styles.greenButton}>
					Start Listen
				</button>
			</div>
		</div>
	);
};

const Home = ({ id }) => (
	<Panel id={id}>
		<PanelHeader>Mic test</PanelHeader>
		<Mic />
	</Panel>
);

Home.propTypes = {
	id: PropTypes.string.isRequired,
	go: PropTypes.func.isRequired,
};

export default Home;
