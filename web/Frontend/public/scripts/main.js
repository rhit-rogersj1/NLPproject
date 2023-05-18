var rhit = rhit || {};

rhit.fbUserCollection = firebase.firestore().collection("uids");
rhit.fbUpdatesDocument = firebase.firestore().collection("updates").doc("newUploads");
rhit.storageRef = firebase.storage().ref();
rhit.uploadPageManager = null;

const CALLOUT_OPTIONS = {
    "async": true,
    "crossDomain": true,
    "method": "GET",
    "headers":{
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://developer.riotgames.com",
    }
}

function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.LoggedInAsController = class {
	constructor(){
		if (document.querySelector("#profilePage") || document.querySelector("#loginPage")) return;
		this._loggedInElement = htmlToElement(`<div id="loggedInAs">Logged in as:</div>`);
		this._profileIconElement = htmlToElement(`<div class="row" style="margin-top: 5px;">
		<div class="col-4 my-auto text-left">
			<img class="pfp" alt="Avatar">
		</div>
		<div class="col-8 my-auto">
			<div class="pfText">None linked<br><span>Level: N/A</span></div>
		</div>
		</div>`);
		this._profileIconElement.addEventListener("click", (event) => {
			window.location.href = "profile.html";
		});
		this._loggedInElement.appendChild(this._profileIconElement);
		document.body.appendChild(this._loggedInElement);
		this._puuid = null;
		this.beginListening(this.updateView.bind(this));
	}

	beginListening(changeListener){
		const docRef = rhit.fbUserCollection.doc(rhit.fbAuthManager.uid);
		docRef.onSnapshot((doc) => {
			if (doc.exists) {
				this._puuid = doc.data().puuid;
			}
			changeListener();
		});
	}

	async updateView(){
		const cards = [];
		await cardMakeSummonerByPuuidNoTrash(this._puuid, cards, 0);
		this._loggedInElement.removeChild(this._profileIconElement);
		this._profileIconElement = htmlToElement(cards[0]);
		this._profileIconElement.addEventListener("click", (event) => {
			window.location.href = "profile.html";
		});
		this._loggedInElement.appendChild(this._profileIconElement);
	}
}

rhit.uploadPageManager = class {
	constructor() {

	}

	removeFriend(puuid) {
		const docRef = rhit.fbUserCollection.doc(rhit.fbAuthManager.uid);
		docRef.get().then((doc) => {
			if (doc.exists){
				const friends = doc.data().friends;
				for( let i = 0; i < friends.length; i++){ 
					if (friends[i] === puuid) { 
						friends.splice(i, 1); 
						docRef.update({friends: friends}).then(() => {console.log("Removed friend.");});
					}
				}
			}
			else console.log("How are you even here?");
		});
	}
}

rhit.uploadPageController = class {
	constructor() {
		document.querySelector("#uploadButton").onclick = (event) => {
			let myInput = document.querySelector("#myFile");
			let file = myInput.files[0];
			if (!file){
				alert("Please select a file to upload.");
				return;
			}
			//now remove old output
			let html = document.querySelector(".indy");
			if (html){
				document.querySelector("#uploadPage").removeChild(html);
			}
			console.log(`Clearing old outputs`);
			let elem = `<div id="indicator" class="indy">Clearing old outputs...</div>`;
			html = htmlToElement(elem);
			document.querySelector("#uploadPage").appendChild(html);
			let docRef = rhit.fbUserCollection.doc(rhit.fbAuthManager.uid);
			docRef.delete().then(() => {
				console.log("Doc successfully deleted!");
				document.querySelector("#uploadPage").removeChild(html);
				elem = `<div id="success" class="indy">Refreshed outputs!</div>`;
				html = htmlToElement(elem);
				document.querySelector("#uploadPage").appendChild(html);
				document.querySelector("#uploadPage").removeChild(html);
				this._upload(file);
			}).catch((error) => {
				console.error("Failure to remove old outputs: ", error);
				document.querySelector("#uploadPage").removeChild(html);
				elem = `<div id="error" class="indy">Error refreshing outputs. Check console logs.</div>`;
				html = htmlToElement(elem);
				document.querySelector("#uploadPage").appendChild(html);
				document.querySelector("#uploadPage").removeChild(html);
				this._upload(file);
			});
		};
		// this.beginListening(this.updateView.bind(this));
	}

	_upload(file){
		console.log(`Uploading ${file.name}`);
		let elem = `<div id="indicator" class="indy">Uploading file...</div>`;
		let html = htmlToElement(elem);
		document.querySelector("#uploadPage").appendChild(html);
		var uidFileRef = rhit.storageRef.child(`${rhit.fbAuthManager.uid}.mp3`);
		uidFileRef.put(file).then((snapshot) => {
			document.querySelector("#uploadPage").removeChild(html);
			let buttonHTML = `<button class="btn" id="outputButton">Summarize</button>`;
			let buttonElement = htmlToElement(buttonHTML);
			buttonElement.onclick = (event) => {
				window.location.href = "/output.html";
			};
			//TODO: Add button listener
			elem = `<div id="success" class="indy">Uploaded file! &nbsp;</div>`;
			html = htmlToElement(elem);
			html.appendChild(buttonElement);
			document.querySelector("#uploadPage").appendChild(html);
			// rhit.fbUpdatesDocument.get().then((doc) => {
			// if (doc.exists) {
			// const data = doc.data();
			// const arrayToUpdate = data.uids;
			
			// if (arrayToUpdate.indexOf(rhit.fbAuthManager.uid) == -1) arrayToUpdate.push(rhit.fbAuthManager.uid);

			// // Update the document with the modified array data
			// rhit.fbUpdatesDocument
			// 	.update({ uids: arrayToUpdate })
			// 	.then(() => {
			// 	console.log("Array updated successfully!");
			// 	})
			// 	.catch((error) => {
			// 	console.error("Error updating array: ", error);
			// 	});
			// 	} else {
			// 	console.log("Document not found!");
			// 	}
			// })
			// .catch((error) => {
			// 	console.error("Error getting document: ", error);
			// });
				}).catch((error) => {
					console.error("Error storing file: ", error);
					document.querySelector("#uploadPage").removeChild(html);
					elem = `<div id="error" class="indy">Error uploading file. Check console logs.</div>`;
					html = htmlToElement(elem);
					document.querySelector("#uploadPage").appendChild(html);
				});
			}

	beginListening(changeListener) {
		const docRef = rhit.fbUserCollection.doc(rhit.fbAuthManager.uid);
		docRef.onSnapshot((doc) => {
			this._friends = doc.data().friends;
			changeListener();
		});
	}

	async updateView() {
		document.querySelector("#friendsContainer").innerHTML = "";
		const div = document.querySelector("#friendsContainer");
		div.innerHTML = "";
		const cards = [];
		for (let i = 0; i<this._friends.length; i++){
			//make cards
			await cardMakeSummonerByPuuid(this._friends[i], cards, 0);
			const friend = htmlToElement(cards[0]);

			//make friends clickable to track and trash icon work
			friend.onclick = (event) => {
				if (event.target.tagName == "I") {
					console.log(event.target);
					console.log(`Removing friend with puuid ${this._friends[i]}...`);
					rhit.uploadPageManager.removeFriend(this._friends[i]);
					return;
				}
				window.location.href = `/friendInfo.html?puuid=${this._friends[i]}`;
			};

			//make everything work before adding to page
			div.appendChild(friend);
		}
	}
}

rhit.initializeAuthUI = function() {
	const ui = new firebaseui.auth.AuthUI(firebase.auth());

	var uiConfig = {
		callbacks: {
		  signInSuccessWithAuthResult: function(authResult, redirectUrl) {
			// User successfully signed in.
			// Return type determines whether we continue the redirect automatically
			// or whether we leave that to developer to handle.
			return true;
		  },
		  uiShown: function() {
			// The widget is rendered.
			// Hide the loader.
			document.getElementById('loader').style.display = 'none';
		  }
		},
		// Will use popup for IDP Providers sign-in flow instead of the default, redirect.
		signInFlow: 'popup',
		signInSuccessUrl: '/upload.html',
		signInOptions: [
		  // Leave the lines as is for the providers you want to offer your users.
		  firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		  firebase.auth.EmailAuthProvider.PROVIDER_ID,
		  firebase.auth.PhoneAuthProvider.PROVIDER_ID,
		  firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
		],
	  };

	  ui.start('#firebaseui-auth-container', uiConfig);
}

rhit.outputPageController = class {
	constructor() {
		let _summary = null;
		let _transcription = null;
		document.querySelector("#newFile").onclick = (event) => {
			window.location.href = "/upload.html";
		};
		this.beginListening(this.updateView.bind(this));
	}

	beginListening(callback){
		let docRef = rhit.fbUserCollection.doc(rhit.fbAuthManager.uid);
		docRef.onSnapshot((doc)=>{
			if (doc.exists){
				this._summary = doc.data().Summary;
				this._transcription = doc.data().Transcription;
				callback();
			}
		});
	}

	updateView() {
		let indicator = document.querySelector("#indicator");
		indicator.style.display = "none";
		//display outputs
		document.querySelector("#summary").textContent = this._summary;
		document.querySelector("#transcription").textContent = this._transcription;
		document.querySelector("#outputContainer").removeAttribute("hidden");
	}
}

rhit.initializePage = function() {
	if (!document.querySelector("#loginPage")){
		const signOutElement = htmlToElement(`<a id="signOutButton"><i class="material-icons">logout</i></a>`);
		signOutElement.addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		});
		document.body.appendChild(signOutElement);
		// new rhit.LoggedInAsController();
	
	  if (!document.querySelector("#uploadPage")){
		const homeElement = htmlToElement(`<a id="homeButton" href="upload.html"><i class="material-icons">home</i></a>`);
		document.body.appendChild(homeElement);
	  }
	}

	if (document.querySelector("#loginPage")){
		rhit.initializeAuthUI();
		document.querySelector("#roseFireButton").addEventListener("click", (event) => {
			rhit.fbAuthManager.signIn();
		});
	}
	if (document.querySelector("#uploadPage")){
		rhit.uploadPageManager = new rhit.uploadPageManager();
		new rhit.uploadPageController();
	}

	if (document.querySelector("#outputPage")){
		new rhit.outputPageController();
	}

}

rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
	}

	signIn() { 
		Rosefire.signIn("3ec8bc8f-743e-411d-a877-0140b92358c9", (err, rfUser) => {
			if (err) {
			  console.log("Rosefire error!", err);
			  return;
			}
			console.log("Rosefire success!", rfUser);
			
			//Use the rfUser.token with your server.
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				if (error.code === 'auth/invalid-custom-token') {
				  console.log("The token you provided is not valid.");
				} else {
				  console.log("signInWithCustomToken error", error.message);
				}
			  });
			
		  });
		  
	}

	signOut() {
		firebase.auth().signOut().catch((err) => {
			console.log("Error signing out:", err);
		});
	}

	beginListening(changeListener){
		firebase.auth().onAuthStateChanged((user)=>{
			this._user = user;
			changeListener();
		});
	}

	get uid(){
		return this._user.uid;
	}

	get isSignedIn(){
		return !!this._user;
	}
}

rhit.redirectPage = function() {
	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn){
		console.log("redirecting");
		window.location.href = "/upload.html";
	}
	if (!(rhit.fbAuthManager.isSignedIn) && !(document.querySelector("#loginPage"))){
		window.location.href = "/";
	}
}


/* Main */
/** function and class syntax examples */
rhit.main = function () {
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		rhit.redirectPage();
		rhit.initializePage();
	});
};

rhit.main();
