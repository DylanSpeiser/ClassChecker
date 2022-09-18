function getSeatInfo(c) {
    let Http = new XMLHttpRequest();
    let url = "https://api.umd.io/v1/courses/sections/"+c.classCode+"-"+c.section;
    let splitCode = splitClassCode(c.classCode);
    var json;

    Http.onload = function () {
        json = JSON.parse(Http.responseText);

        if (json != undefined) {
            c.totalSeats = parseInt(json[0].seats);
            c.openSeats = parseInt(json[0].open_seats);
            c.takenSeats = c.totalSeats-c.openSeats;
            c.percentFull = (c.takenSeats / c.totalSeats)*100.0;
        } else {
            console.log("json was unefined for url "+url)
        }
    };

    Http.open("GET",url);
    Http.send(); 
}

class ScheduleClass {
    constructor(classCode, section) {
      this.classCode = classCode;
      this.section = section;
    }
}

ScheduleClass.prototype.toString = function ClassToString() {
  return `${this.classCode} ${this.section}`;
}

let classes = [];
let table = document.getElementById("Spring2023").getElementsByClassName('ScheduleTable')[0];

function updateTable() {
    let tabLen = table.rows.length;

    for (let i = 1; i < tabLen; i++){
        table.deleteRow(1);
    }

    for (let j = 0; j < classes.length; j++) {    
        getSeatInfo(classes[j]);

        var row = table.insertRow();
        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var cell2 = row.insertCell(2);
        var cell3 = row.insertCell(3);
        var cell4 = row.insertCell(4);
        var cell5 = row.insertCell(5);
        var cell6 = row.insertCell(6);
        var cell7 = row.insertCell(7);

        cell0.innerHTML = classes[j].classCode;
        cell1.innerHTML = classes[j].section;
        cell2.innerHTML = classes[j].totalSeats;
        cell3.innerHTML = classes[j].openSeats;
        cell4.innerHTML = classes[j].takenSeats;
        cell5.innerHTML = Math.round(classes[j].percentFull*100)/100 +"%";
        cell6.innerHTML = "<progress max="+classes[j].totalSeats+" value="+classes[j].takenSeats+"></progress>"
        cell7.innerHTML = "<a href=\"#\" onclick=\"deleteClass("+(j+1)+")\">x</a>";
    }
}

function formSubmit() {
    let code = document.getElementById('classCodeInput').value;
    let sec = document.getElementById('sectionInput').value;

    if ((code == null || sec == null) || (code == "" || sec == "")) {
        throw "Invalid Input!";
    }

    classes.push(new ScheduleClass(code,sec))
    updateTable();
    setTimeout(() => {  updateTable(); }, 500);

    storeCookie(classes,'classes');
}

function onLoad() {
    if (document.cookie == '' || document.cookie=='classes=') {

        let classes = [];

        updateTable();
        setTimeout(() => {  updateTable(); }, 200);

        storeCookie(classes,"classes");
    } else {
        loadCookie(classes,"classes");
    }

    updateTable();
    setTimeout(() => {  updateTable(); }, 200);
}

function deleteClass(index) {
    classes.splice(index-1,1);
    updateTable();

    storeCookie(classes,"classes");
}

function storeCookie(a, name) {
    document.cookie = (name+"="+a.toString()+"; expires=05 Sep 2022 23:00:00 UTC; path=/");
}

function loadCookie(a,name) {
    cookArr = getCookie(name).split(',');

    for (let i = 0; i < cookArr.length; i++) {
        sep = cookArr[i].split(" ");
        a.push(new ScheduleClass(sep[0],sep[1]));
    }
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ')
            c = c.substring(1);
        if (c.indexOf(nameEQ) != -1)
            return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function splitClassCode(code) {
    var num = code.match(/\d+/g);
    var subj = code.substring(0,code.indexOf(num));

    return [subj, code.replace(subj,'')];
}
