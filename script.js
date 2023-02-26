"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];
let filterSelectedGender = "all";
let filterSelectedHouse = "all";
let filterSelectedBlood = "all";

// The prototype for all students:
const Student = {
  fullname: "",
  house: "-unknown house-",
  gender: "",
  star: false,
};

const settings = {
  filterBy: "all",
  sortBy: "lastname",
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
}

async function loadJSON() {
  const response = await fetch(
    "https://petlatkea.dk/2021/hogwarts/students.json"
  );
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
    case "star":
      filteredList = allStudents.filter(isStar);
      break;
    default:
      filteredList = allStudents;
      break;
  }
  return filteredList;
}

function isStar(student) {
  return student.star;
}

function filterGender(target) {
  filterSelectedGender = target.value;
  buildList();
}

function filterHouse(target) {
  filterSelectedHouse = target.value;
  buildList();
}

function filterBlood(target) {
  filterSelectedBlood = target.value;
  buildList();
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
    const fullName = `${student.firstName} ${student.lastName}`;
    return (
      student.firstName.toLowerCase().includes(searchTerm) ||
      student.lastName.toLowerCase().includes(searchTerm) ||
      fullName.toLowerCase().includes(searchTerm)
    );
  });

  buildList(filteredList);
}

function buildList() {
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);

  displayList(sortedList);
}

function displayList(students) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  students.forEach(displayStudent);
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
  clone.querySelector("[data-field=lastname]").textContent = student.lastName;
  clone.querySelector("[data-field=firstname]").textContent = student.firstName;
  clone.querySelector("[data-field=middlename]").textContent =
    student.middleName;
  clone.querySelector("[data-field=house]").textContent = student.house;
  clone.querySelector("[data-field=gender]").textContent = student.gender;
  clone.querySelector("[data-field=blood]").textContent = student.bloodType;

  if (student.star) {
    clone.querySelector("[data-field=star]").textContent = "⭐";
  } else {
    clone.querySelector("[data-field=star]").textContent = "☆";
  }

  clone.querySelector("[data-field=star]").addEventListener("click", clickStar);

  function clickStar() {
    if (student.star) {
      student.star = false;
    } else {
      student.star = true;
    }
    buildList();
  }

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
