document.addEventListener("DOMContentLoaded", function () {
    fetch("/git/list-repos")
        .then(response => response.json())
        .then(data => {
            const repoList = document.getElementById("public-repo-list");
            repoList.innerHTML = ""; // Clear any existing content
            data.repos.forEach(repo => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <span class="file" onclick="window.location.href='/code/editor/${repo}'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="16 18 22 12 16 6"/>
                            <polyline points="8 6 2 12 8 18"/>
                        </svg>
                        ${repo}
                    </span>
                `;
                repoList.appendChild(li);
            });
        })
        .catch(error => console.error("Error fetching repos:", error));
});

function importRepourl(){
    var dir = prompt("Please enter the directory name");
    var url = document.getElementById("repourl").value;
    if(!dir){
        alert("Please enter a valid directory name");
        return;
    }
    else{

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
             "url": url,
             "dir": dir
        });

        const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
        };

        fetch("/git/clone", requestOptions)
        .then((response) => response.text())
        .then((result) => alert("success"))
        .catch((error) => alert(error));

    }
    toggleImportWindow()
}

function importRepogithub(url){
    var dir = prompt("Please enter the directory name");
    if(!dir){
        alert("Please enter a valid directory name");
        return;
    }
    else{

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
             "url": url,
             "dir": dir
        });

        const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
        };

        fetch("/git/clone", requestOptions)
        .then((response) => response.text())
        .then((result) => alert("success"))
        .catch((error) => alert(error));

    }
    toggleImportWindow()
}



function toggleImportWindow() {
    document.querySelectorAll(".import-window-bg").forEach(element => {
        element.style.display = (element.style.display === "none" || element.style.display === "") ? "flex" : "none";
    });
}

document.getElementById("search-btn").addEventListener("click", function () {
    let query = document.getElementById("github-search-bar").value.trim();
    if (query.length < 2) return;

    document.getElementById("search-content").innerHTML = "<p>Loading...</p>"; // Show loading
    fetchAllRepos(query);
});

async function fetchAllRepos(query) {
    let allRepos = [];
    let page = 1;
    let perPage = 100; // Max limit per request
    let totalCount = 0;

    while (true) {
        let response = await fetch(`https://api.github.com/search/repositories?q=${query}&per_page=${perPage}&page=${page}`);
        let data = await response.json();

        if (!data.items || data.items.length === 0) break; // No more results

        allRepos = allRepos.concat(data.items);
        totalCount = data.total_count;

        if (allRepos.length >= totalCount) break; // Stop when all are fetched

        page++; // Fetch next page
    }

    displayResults(allRepos);
}

function displayResults(repos) {
    let searchContent = document.getElementById("search-content");
    searchContent.innerHTML = ""; // Clear previous results

    repos.forEach(repo => {
        let repoElement = document.createElement("li");
        repoElement.className = "repo";
        repoElement.innerHTML = ` <span class="file" onclick="importRepogithub('${repo.html_url}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="16 18 22 12 16 6"/>
                            <polyline points="8 6 2 12 8 18"/>
                        </svg>
                        ${repo.full_name}
                    </span>`;
        searchContent.appendChild(repoElement);
    });

    if (repos.length === 0) {
        searchContent.innerHTML = "<p>No results found.</p>";
    }
}




document.addEventListener("DOMContentLoaded", function () {
const gitUrlRadio = document.getElementById("git-url");
const githubRadio = document.getElementById("github");
const githubSearch = document.getElementById("github-search");
const importWindowContent = document.getElementById("import-window-content");

function updateDisplay() {
if (gitUrlRadio.checked) {
    githubSearch.style.display = "none";
    importWindowContent.style.display = ""; // Show it
} else if (githubRadio.checked) {
    githubSearch.style.display = "";
    importWindowContent.style.display = "none";
}
}

gitUrlRadio.addEventListener("change", updateDisplay);
githubRadio.addEventListener("change", updateDisplay);

updateDisplay(); // Run on page load to apply correct state
});

document.addEventListener("DOMContentLoaded", function () {
document.querySelectorAll("li").forEach(li => {
li.addEventListener("click", function (event) {
    // Prevent event from bubbling up to parent elements
    event.stopPropagation();

    // Check if the clicked <li> has a nested <ul> with the class "folder"
    if (this.querySelector(".folder")) {
        this.classList.toggle("collapsed");
    }
});
});
});


const width = 1000;
const height = 200;
const cellSize = 15;
const formatDay = d3.timeFormat("%w");
const formatWeek = d3.timeFormat("%U");
const formatDate = d3.timeFormat("%Y-%m-%d");
const formatMonth = d3.timeFormat("%b");
const formatMonthWeek = d3.timeFormat("%m-%d");

const colorScale = d3.scaleQuantize()
    .domain([0, 10])
    .range(["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"]);

const svg = d3.select("#calendar").append("svg")
    .attr("width", width)
    .attr("height", height + 30)
    .attr("viewBox", `0 0 ${width} ${height + 30}`);

const now = new Date();
const start = new Date(now.getFullYear(), 0, 1);
const end = new Date(now.getFullYear(), 11, 31);
const days = d3.timeDays(start, end);

const data = new Map(days.map(d => [formatDate(d), Math.floor(Math.random() * 10)]));
console.log(data);
const heatmap = svg.append("g").attr("class", "heatmap");

heatmap.selectAll(".day")
    .data(days)
    .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", d => formatWeek(d) * (cellSize + 3) + 40)
    .attr("y", d => formatDay(d) * (cellSize + 3) + 30)
    .attr("fill", d => colorScale(data.get(formatDate(d)) || 0))
    .attr("rx", 4)
    .attr("ry", 4)
    .append("title").text(d => `${formatDate(d)}: ${data.get(formatDate(d)) || 0}`);

svg.selectAll(".month-label")
    .data(d3.timeMonths(start, end))
    .enter().append("text")
    .attr("class", "month-label")
    .attr("x", d => formatWeek(d) * (cellSize + 3) + 40)
    .attr("y", 20)
    .text(d => formatMonth(d));

svg.selectAll(".day-label")
    .data(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])
    .enter().append("text")
    .attr("class", "day-label")
    .attr("x", 5)
    .attr("y", (d, i) => i * (cellSize + 3) + 40)
    .text(d => d);
function settingVisible(){
    var x = document.getElementById("setting-background");
    var y = document.getElementById("projects-bg");
    if (x.style.display === "none") {
        x.style.display = "flex";
        y.style.display = "none";
    } else {
        x.style.display = "none";
        y.style.display = "block";
    }
}
function logout(){
    firebase.auth().signOut().then(() => {
        console.log("User signed out.");
      }).catch((error) => {
        console.error("Error signing out:", error);
      });
}
function verifyemail(){
    firebase.auth().currentUser.sendEmailVerification()
  .then(() => {
    alert("Verification email sent.");
  })
  .catch((error) => {
    console.error("Error sending verification email:", error);
  });

}