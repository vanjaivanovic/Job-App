// Array for savedJobs list
let storedJobs = [];
loadData();

const FetchModel = {
	fetchAll(numberOfJobs = 10, countyID = 1) {
    //let job = numberOfJobs;
    return fetch(
    	`http://api.arbetsformedlingen.se/af/v0/platsannonser/matchning?sida=1&antalrader=${numberOfJobs}&yrkesomradeid=3&lanid=${countyID}`
    	)
    .then(response => response.json())
    .then(data => {
        //let listings = data.matchningslista;
        //ResponseController.sortResponse(data);
        ResponseController.getTotalNumberOfJobs(data);
        ResponseController.getJobDetails();

        const buttons = document.getElementsByClassName("save");

        for (const button of buttons) {
        	button.addEventListener("click", function() {
        		updateLocalStorage(this.parentElement.id);
        	});
        }
    })
    .catch(error => console.log(error));
},
  //detailed
  fetchByIdHTML(annonsId) {
  	return fetch(
  		`http://api.arbetsformedlingen.se/af/v0/platsannonser/${annonsId}/typ=html`
  		)
  	.then(response => response.text())
  	.then(job => {
  		View.displayJobDetails(job);

  		const goBackButton = document.getElementById("goBack");
  		goBackButton.addEventListener("click", function() {
  			window.history.go(-1);
  			NavigationView.showLandingPage();
  		});
  	})
  	.catch(error => console.log(error));
  },
  //summary
  fetchByIdJSON(annonsId) {
  	return fetch(
  		`http://api.arbetsformedlingen.se/af/v0/platsannonser/${annonsId}`
  		)
  	.then(response => response.json())
  	.then(job => {
  		View.displaySavedJobCard(job);
  	})
  	.catch(error => console.log(error));
  },

  fetchAllCounties() {
  	return fetch(
  		`http://api.arbetsformedlingen.se/af/v0/platsannonser/soklista/lan`
  		)
  	.then(response => response.json())
  	.then(counties => {
  		const countiesArray = counties.soklista.sokdata;
  		console.log(counties.soklista.sokdata);
  		FilterController.selectCounty(countiesArray);
  	})
  	.catch(error => console.log(error));
  }
};

const ResponseController = {
	getJobId() {
		const urlString = window.location.href;
		const url = new URL(urlString);
		const jobID = url.searchParams.get("jobDetail");
    //FetchModel.fetchById(jobID);
    return jobID;
},
  // sortResponse(data) {
  //   console.log(data);
  // },

  getTotalNumberOfJobs(data) {
  	let totalNumberOfJobs = data.matchningslista.antal_platsannonser;
  	let latestJobs = data.matchningslista.matchningdata;
  	ResponseController.getLatestJobs(latestJobs);
  	View.displayTotalNumberOfJobs(totalNumberOfJobs);
  },

  getLatestJobs(latestJobs) {
  	for (let job of latestJobs) {
  		View.displayLatestJob(job);
  	}
  },

  getJobDetails() {
  	const buttons = document.getElementsByClassName("showDetails");
  	for (const button of buttons) {
  		button.addEventListener("click", function() {
  			FetchModel.fetchByIdHTML(this.parentElement.id);
  			window.location.hash = `?jobDetail=${this.parentElement.id}`;
  			NavigationView.showJobDetails();
  		});
  	}
  }
};

const FilterController = {
	numberOfJobs: "10",
	countyID: "1",
	selectNumberOfJobs() {
		const numberOfJobsInput = document.getElementById("numberOfJobs");

		numberOfJobsInput.addEventListener("change", function() {
			let numberOfJobs = numberOfJobsInput.selectedIndex;
			let filterAmount = document.getElementsByTagName("option")[numberOfJobs]
			.value;
			FilterView.registerNumberOfJobs(filterAmount, FilterController.countyID);
		});
	},

	selectCounty(counties) {
		const countyFilter = document.getElementById("county");
		for (const county of counties) {
      //console.log(county);
      const countyOption = document.createElement("option");
      countyOption.innerText = county.namn;
      countyOption.id = county.id;
      countyOption.classList.add("county");
      console.log("county id: ", county.id);
      countyFilter.appendChild(countyOption);
  }
 	 countyFilter.addEventListener("change", function() {
      //console.log(thi);

      let countyIndex = countyFilter.selectedIndex;
      let selectedCounty = document.getElementsByClassName("county")[
      countyIndex].id;

      FilterView.registerSelectedCounty(selectedCounty);
  	});
  }

};

const View = {
	totalNumberOfJobsHeader: document.getElementById("totalNumberOfJobsHeader"),
	displayTotalNumberOfJobs(totalNumberOfJobs) {
		totalNumberOfJobsHeader.innerHTML = `
		<div class="numberOfJobs">
		<h1>${totalNumberOfJobs}</h1>
		<p>Available jobs in Stockholm</p>
		</div>`;
	},

	jobContainer: document.getElementById("jobContainer"),

	displayLatestJob(job) {
		const jobCardHTML = `<div id="${job.annonsid}">
		<h2>${job.annonsrubrik}</h2>
		<p class="profession">${job.yrkesbenamning}</p>
		<p class="company">${job.arbetsplatsnamn}</p>
		<p class="typeOfEmpoloyment">${job.anstallningstyp}</p>
		<p class="municipality">${job.kommunnamn}</p>
		<p class="deadline">Sök före ${job.sista_ansokningsdag}</p>
		<a href="${job.annonsurl}" target="_blank"><p class="link">Läs mer</p></a>
		<button class="save">Spara</button>
		<button class="showDetails">Visa detaljer</button>
		</div>`;

		jobContainer.insertAdjacentHTML("beforeEnd", jobCardHTML);
	},

	containerJobDetails: document.getElementById("containerJobDetails"),
	containerSavedJobs: document.getElementById("containerSavedJobs"),

	displaySavedJobCard(annonsId) {
		let job = annonsId.platsannons;

		const savedJobCardHTML = `<div>
		<h2>${job.annons.annonsrubrik}</h2>
		<p class="profession">${job.annons.yrkesbenamning}</p>
		<p class="company">${job.arbetsplats.arbetsplatsnamn}</p>
		<p class="typeOfEmpoloyment">${job.annons.anstallningstyp}</p>
		<p class="municipality">${job.annons.kommunnamn}</p>
		<p class="deadline">Sök före ${job.annons.sista_ansokning}</p>
		<a href="${
			job.annons.platsannonsUrl
		}" target="_blank"><p class="link">Läs mer</p></a>
		<button class="delete" id="${job.annons.annonsid}">Delete</button>
		</div>`;

		containerSavedJobs.insertAdjacentHTML("beforeEnd", savedJobCardHTML);
	},

	displayJobDetails(jobDetailsCardHTML) {
		const goBackButton = `
		<button id="goBack" class="goBack">Gå tillbaka</button>
		`;

    //const jobDetailsCardHTML = `
    //    <h2>${annonsId.platsannons.annons.annonsrubrik}</h2>
    //  <p>${annonsId.platsannons.annons.annonstext}</p>
    //  <button id="goBack" class="goBack">Gå tillbaka</button>
    //  `;

    containerJobDetails.innerHTML = jobDetailsCardHTML;
    containerJobDetails.insertAdjacentHTML("beforeEnd", goBackButton);
}
}; // End of View module

const NavigationView = {
	header: document.getElementById("header"),
	mySavedJobs: document.getElementById("mySavedJobs"),

	containerLandingPage: document.getElementById("containerLandingPage"),
	containerJobDetails: document.getElementById("containerJobDetails"),
	containerSavedJobs: document.getElementById("containerSavedJobs"),

	refreshLandingPage() {
		NavigationView.header.addEventListener("click", function() {
			location.reload();
			window.location = "";
      //Clear URL here
  });
	},
	showLandingPage() {
		NavigationView.containerLandingPage.classList.remove("hidden");
		NavigationView.containerJobDetails.classList.add("hidden");
		NavigationView.containerSavedJobs.classList.add("hidden");
	},
	showJobDetails() {
		NavigationView.containerLandingPage.classList.add("hidden");
		NavigationView.containerJobDetails.classList.remove("hidden");
		NavigationView.containerSavedJobs.classList.add("hidden");
	},
	showSavedJobs() {
		NavigationView.mySavedJobs.addEventListener("click", function() {
			NavigationView.containerLandingPage.classList.add("hidden");
			NavigationView.containerJobDetails.classList.add("hidden");
			NavigationView.containerSavedJobs.classList.remove("hidden");

			for (annonsId of storedJobs) {
				FetchModel.fetchByIdJSON(annonsId);
			}
		});
	}
}; // End of NavigationView

const FilterView = {

	registerNumberOfJobs(filterAmount) {
		View.jobContainer.innerHTML = "";
		FilterController.numberOfJobs = filterAmount;
		FetchModel.fetchAll(FilterController.numberOfJobs);
	},
	
  	registerSelectedCounty(selectedCounty){
  	  View.jobContainer.innerHTML = "";
      FilterController.countyID = selectedCounty;
      FetchModel.fetchAll(FilterController.numberOfJobs, selectedCounty);
     }
};


function updateLocalStorage(annonsId) {
  //push the annonsId into the array
  storedJobs.push(annonsId);

  // set the savedJobs on localStorage with the storedJobs data.
  localStorage.setItem("savedJobs", JSON.stringify(storedJobs));
}

function loadData() {
  // Checks if there is anything in local storage,
  // and makes storedJobs equal to savedJobs in localStorage
  if (localStorage.getItem("savedJobs")) {
  	storedJobs = JSON.parse(localStorage.getItem("savedJobs"));
  } else {
  	storedJobs = [];
  }
}

/***************************************/
/************* CALL FUNCTIONS **********/
/***************************************/
if (!ResponseController.getJobId()) {
	FetchModel.fetchAll();
} else {
	FetchModel.fetchByIdHTML(ResponseController.getJobId());
}
NavigationView.refreshLandingPage();
NavigationView.showSavedJobs();

FilterController.selectNumberOfJobs();
FetchModel.fetchAllCounties();