"use strict";
import { getBloodStatus } from "./scriptBlood.js";
const url = "https://petlatkea.dk/2021/hogwarts/students.json";
let allStudents = [];
let expelStudents = [];
let filterSelectedGender = "all";
let filterSelectedHouse = "all";
let filterSelectedBlood = "all";
let filterSelectedExpelled = "whitelist";

start();

// The prototype for all students:
const Student = {
  fullname: "",
  house: "-unknown house-",
  gender: "",
  squad: false,
  prefects: false,
};

const settings = {
  filterBy: "all",
  sortBy: "name",
  sortDir: "asc",
};

function start() {
  console.log("ready");

  loadJSON();
  // Add event-listeners to filter and sort buttons
  registerButtons();
}

function registerButtons() {
  document
    .querySelectorAll("[data-action='filter']")
    .forEach((button) => button.addEventListener("click", selectFilter));

  document
    .querySelectorAll("[data-action='sort']")
    .forEach((button) => button.addEventListener("click", selectSort));

  document.querySelector("#search-btn").addEventListener("click", search);
  document.querySelector("#hack-btn").addEventListener("click", hackTheSystem);
  document.querySelector("#gender").addEventListener("change", filterGender);
  document.querySelector("#house").addEventListener("change", filterHouse);
  document.querySelector("#blood").addEventListener("change", filterBlood);
  document
    .querySelector("#expelled")
    .addEventListener("change", filterExpelled);

  document.querySelector("#expel-btn").addEventListener("click", expelStudent);
}

async function loadJSON() {
  const response = await fetch(url);
  const jsonData = await response.json();
  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  allStudents = jsonData.map(prepareObject);
  // fixed so we filter and sort on the first load
  buildList();
}

function capitalize(str) {
  const trimmedStr = str.trim(); // remove leading/trailing whitespace
  const firstChar = trimmedStr.charAt(0).toUpperCase();
  const restOfString = trimmedStr.slice(1).toLowerCase();
  return firstChar + restOfString;
}

function prepareObject(jsonObject) {
  const student = Object.create(Student);
  const fullname = capitalize(jsonObject.fullname);
  const nameParts = fullname.split(" ");
  student.firstName = nameParts[0];
  student.lastName = capitalize(nameParts[nameParts.length - 1]);
  student.middleName = null;
  student.nicknames = null;
  if (nameParts.length > 2) {
    const middleNameParts = nameParts.slice(1, nameParts.length - 1);
    const nicknameParts = middleNameParts.filter(
      (part) => part.startsWith('"') && part.endsWith('"')
    );
    const nonNicknameParts = middleNameParts.filter(
      (part) => !part.startsWith('"') || !part.endsWith('"')
    );
    student.middleName = nonNicknameParts.map(capitalize).join(" ");
    student.nicknames = nicknameParts.map((nickname) => nickname.slice(1, -1));
  } else if (nameParts.length === 2) {
    student.middleName = null;
    student.nicknames = null;
  }
  student.house = capitalize(jsonObject.house);
  student.gender = capitalize(jsonObject.gender);
  student.blood = getBloodStatus(student.lastName);
  student.expelled = "whitelist";
  return student;
}

function selectFilter(event) {
  const filter = event.target.dataset.filter;
  console.log(`User selected ${filter}`);
  // filterList(filter);
  setFilter(filter);
}

function setFilter(filter) {
  if (filter === "search") {
    settings.filterBy = "search";
  } else {
    settings.filterBy = filter;
  }
  buildList();
}

function filterList(filteredList) {
  switch (settings.filterBy) {
    case "squad":
      filteredList = allStudents.filter(isSquad);
      break;
    case "prefects":
      filteredList = allStudents.filter(isPrefect);
      break;
    default:
      filteredList = allStudents;
      break;
  }
  return filteredList;
}

function isPrefect(student) {
  return student.prefects;
}

function isSquad(student) {
  return student.squad;
}

function filterGender() {
  filterSelectedGender = document.querySelector("#gender").value;
  buildList();
}
function filterHouse() {
  filterSelectedHouse = document.querySelector("#house").value;
  buildList();
}

function filterBlood() {
  filterSelectedBlood = document.querySelector("#blood").value;
  buildList();
}

function filterExpelled() {
  if (filterSelectedExpelled.value === "whitelist") {
    displayStudents(allStudents);
  } else if (filterSelectedExpelled.value === "blacklist") {
    displayStudents(expelStudents);
  }
}

function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  // find "old" sortby element, and remove .sortBy
  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  oldElement.classList.remove("sortby");

  // indicate active sort
  event.target.classList.add("sortby");

  // toggle the direction!
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  console.log(`User selected ${sortBy} - ${sortDir}`);
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortList(sortedList) {
  let direction = settings.sortDir === "asc" ? 1 : -1;

  sortedList = sortedList.sort((a, b) => {
    let comparison = 0;

    if (a[settings.sortBy] < b[settings.sortBy]) {
      comparison = -1;
    } else if (a[settings.sortBy] > b[settings.sortBy]) {
      comparison = 1;
    }

    return comparison * direction;
  });

  return sortedList;
}

function search() {
  const searchTerm = document
    .querySelector("#search")
    .value.trim()
    .toLowerCase();

  const filteredList = allStudents.filter((student) => {
    const fullname = `${student.firstName} ${student.lastName}`;
    return fullname.toLowerCase().includes(searchTerm);
  });

  displayList(filteredList);
}

function hackTheSystem() {
  student.firstName = "Lukas";
  student.lastName = "Gravgaard";
  student.house = "Huffelpuff";
  student.gender = "Boy";
  student.blood = "Pure";

  allStudents.push(student);
  displayStudent(student);
  document.getElementById("hack-btn").disabled = true;

  buildList();
}

function buildList() {
  const currentList = filterList(allStudents);
  const currentListExpel = filterList(expelStudents);
  const sortedList = sortList(currentList);
  const sortedListExpel = sortList(currentListExpel);
  if ((filterSelectedExpelled = "whitelist")) {
    displayList(sortedList);
  } else if ((filterSelectedExpelled = "blacklist")) {
    displayList(sortedListExpel);
  }
}

function displayList(students) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  students.forEach(displayStudent);
}

function showImage(firstName, lastName) {
  return `images/${lastName.toLowerCase()}_${firstName
    .charAt(0)
    .toLowerCase()}.png`;
}

function expelStudent() {
  const popup = document.querySelector(".popup-2");
  const studentName = popup.querySelector(".firstname").value;
  const studentIndex = allStudents.findIndex(
    (student) => student.name === studentName
  );
  if (studentIndex !== -1) {
    const student = allStudents[studentIndex];
    student.expelled = "Expelled";
    expelStudents.push(student);
    allStudents.splice(studentIndex, 1);
    buildList();
  }
}

function displayStudent(student) {
  // create clone
  const clone = document
    .querySelector("template#student")
    .content.cloneNode(true);

  // set clone data
  if (filterSelectedGender != "all" && student.gender != filterSelectedGender)
    return;
  if (filterSelectedHouse != "all" && student.house != filterSelectedHouse)
    return;
  if (filterSelectedBlood != "all" && student.blood != filterSelectedBlood)
    return;
  if (
    filterSelectedExpelled != "all" &&
    student.expelled != filterSelectedExpelled
  )
    return;
  clone.querySelector("[data-field=lastname]").textContent = student.lastName;
  clone.querySelector("[data-field=firstname]").textContent = student.firstName;
  clone.querySelector("[data-field=middlename]").textContent =
    student.middleName;
  clone.querySelector("[data-field=house]").textContent = student.house;
  clone.querySelector("[data-field=gender]").textContent = student.gender;
  clone.querySelector("[data-field=blood]").textContent = student.blood;
  clone.querySelector("[data-field=expelled]").textContent = student.expelled;
  if (student.squad) {
    clone.querySelector("[data-field=squad]").textContent = "⭐";
  } else {
    clone.querySelector("[data-field=squad]").textContent = "☆";
  }

  if (student.prefects) {
    clone.querySelector("[data-field=prefects]").textContent = "⭐";
  } else {
    clone.querySelector("[data-field=prefects]").textContent = "☆";
  }

  clone
    .querySelector("[data-field=squad]")
    .addEventListener("click", clicksquad);
  clone
    .querySelector("[data-field=prefects]")
    .addEventListener("click", clickPrefects);

  function clicksquad() {
    if (student.squad) {
      student.squad = false;
    } else {
      student.squad = true;
    }
    buildList();
  }

  function clickPrefects() {
    if (student.prefect) {
      student.prefects = false;
    } else {
      student.prefects = true;
    }
    buildList();
  }

  clone
    .querySelector(".student-container")
    .addEventListener("click", () => visDetaljer(student));

  function visDetaljer(student) {
    popup.style.display = "flex";
    popup.querySelector(".picture").src = showImage(
      student.firstName,
      student.lastName
    );
    popup.querySelector(".picture").alt = student.lastName;
    popup.querySelector(".lastname").textContent = student.lastName;
    popup.querySelector(".firstname").textContent = student.firstName;
    popup.querySelector(".middlename").textContent = student.middleName;
    popup.querySelector(".house").textContent = student.house;
    popup.querySelector(".gender").textContent = student.gender;
  }
  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
