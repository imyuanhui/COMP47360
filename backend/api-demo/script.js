const BASE_URL = "http://localhost:8080";

let accessToken = "";
let refreshTokenVal = "";

function signup() {
  const email = document.getElementById("signupEmail").value;
  const username = document.getElementById("signupUsername").value;
  const password = document.getElementById("signupPassword").value;

  fetch(`${BASE_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("signupOutput").textContent = JSON.stringify(
        data,
        null,
        2
      );
      alert("Registration successful. Please log in.");
    })
    .catch((err) => {
      document.getElementById("signupOutput").textContent =
        "Error: " + err.message;
    });
}

function login() {
  const identifier = document.getElementById("identifier").value;
  const password = document.getElementById("password").value;

  fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      accessToken = data.accessToken;
      refreshTokenVal = data.refreshToken;
      document.getElementById("loginOutput").textContent =
        "Login successful.\n" + JSON.stringify(data, null, 2);
    });
}

function refreshToken() {
  fetch(`${BASE_URL}/api/token/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refreshTokenVal }),
  })
    .then((res) => res.json())
    .then((data) => {
      accessToken = data.accessToken;
      document.getElementById("refreshOutput").textContent =
        "Access token refreshed.\n" + JSON.stringify(data, null, 2);
    });
}

function getProfile() {
  fetch(`${BASE_URL}/api/profile`, {
    headers: { Authorization: "Bearer " + accessToken },
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("profileOutput").textContent = JSON.stringify(
        data,
        null,
        2
      );
    });
}

function getTrips() {
  fetch(`${BASE_URL}/api/trips`, {
    headers: { Authorization: "Bearer " + accessToken },
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("tripsOutput").textContent = JSON.stringify(
        data,
        null,
        2
      );
    });
}

function createTrip() {
  const tripName = document.getElementById("tripName").value;
  const startDateTime = document.getElementById("startDate").value;
  const endDateTime = document.getElementById("endDate").value;
  const numTravellers = parseInt(
    document.getElementById("numTravellers").value
  );

  fetch(`${BASE_URL}/api/trips`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tripName,
      startDateTime,
      endDateTime,
      numTravellers,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      alert("Trip created!");
      getTrips();
    });
}

function deleteTrip() {
  const tripId = document.getElementById("deleteTripId").value;

  fetch(`${BASE_URL}/api/trips/${tripId}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + accessToken },
  }).then((res) => {
    if (res.status === 204) {
      alert("Trip deleted");
      getTrips();
    } else {
      alert("Delete failed");
    }
  });
}
