const url = "https://petlatkea.dk/2021/hogwarts/families.json";
let pure = [];
let half = [];

loadJSON();
("use strict");
async function loadJSON() {
  fetch(url)
    .then((response) => response.json())
    .then((jsonData) => {
      half = jsonData.half;
      pure = jsonData.pure;
      getBloodStatus();
    });
}

function capitalize(str) {
  const trimmedStr = str.trim(); // remove leading/trailing whitespace
  const firstChar = trimmedStr.charAt(0).toUpperCase();
  const restOfString = trimmedStr.slice(1).toLowerCase();
  return firstChar + restOfString;
}

export function getBloodStatus(lastName) {
  if (pure.includes(lastName)) {
    return "Pure";
  }
  if (half.includes(lastName)) {
    return "Half";
  } else {
    return "Muggle";
  }
}
