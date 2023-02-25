"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];
let filterSelectedGender = "all";

// The prototype for all students:
const Student = {
  fullname: "",
  house: "-unknown house-",
  gender: "",
  star: false,
};

const settings = {
  filterBy: "all",
  sortBy: "fullname",
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

function prepareObject(jsonObject) {
  const student = Object.create(Student);

  const texts = jsonObject.fullname.split(" ");
  student.fullname = jsonObject.fullname;
  student.firstname = texts[0];
  student.house = jsonObject.house;
  student.gender = jsonObject.gender;

  return student;
}

function selectFilter(event) {
  const filter = event.target.dataset.filter;
  console.log(`User selected ${filter}`);
  // filterList(filter);
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
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

function filterGender(target) {
  filterSelectedGender = target.value;
  buildList();
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    settings.sortDir = "asc";
  }

  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
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
  clone.querySelector("[data-field=fullname]").textContent = student.fullname;
  clone.querySelector("[data-field=house]").textContent = student.house;
  clone.querySelector("[data-field=gender]").textContent = student.gender;
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
