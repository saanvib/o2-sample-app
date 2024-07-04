const connectHostButton = document.getElementById("connecthost");
const viewServicesButton = document.getElementById("viewservices");
const createServiceButton = document.getElementById("createservice");
const connectedMessage = document.getElementById("connected");
const servicesListDisplay = document.getElementById("serviceslist");
const newServiceName = document.getElementById("newName");
const messageSend = document.getElementById("sendMessage");
var messageType;
const ensembleName = "saanvi";
const host = "localhost:8000";
var data = {services: [] };
var serviceNameMsgs;
let selectedService = "";


setTimeout(function () {
  // document.getElementById('serviceslist').addEventListener reload(document.URL +  ' #serviceslist');
}, 1000);

function o2wsInit() {
  o2ws_initialize(ensembleName, host);
  console.log("connection successful");
  connectedMessage.hidden = false;
  //   o2ws_status_msgs_enable = true;
  o2ws_method_new("/_o2/ls", "siss", false, handle_list_services, null);
   handlebarsHelpers();

}

function handlebarsHelpers() {
   Handlebars.registerHelper('ifCond', function(v1, v2, options) {
      if (v1 === v2) {
            return true;
         }
      return false;
   });
}

function o2ws_status_msg(msg) {
  console.log("status message received: " + msg);
}

function o2ws_on_error(msg) {
  console.log("error message received: " + msg);
}

window.addEventListener("load", o2wsInit, false);

function handle_list_services(address, typespec, info) {
  console.log("handler called: " + address);
  var service_name = o2ws_get_string();
  console.log(service_name);
  var status = o2ws_get_int();
  console.log(status);
  x = o2ws_get_string();
  console.log(x);
  x = o2ws_get_string();
  console.log(x);
  console.log(address);
  console.log(info);
  displayService(service_name, status);
}

function handle_message(timestamp, address, typespec, info) {
  console.log("handler for message called for service");
  const messageData = {
   timestamp: timestamp,
   message: "",
 };
  let a;
  console.log("typespec is " + typespec);
  for (let i = 0; i < typespec.length; i++) {
    if (typespec[i] === "i") {
      a = o2ws_get_int();
    } else if (typespec[i] === "s") {
      a = o2ws_get_string();
    } else if (typespec[i] === "f") {
      a = o2ws_get_float();
    } else if (typespec[i] === "d") {
      a = o2ws_get_double();
    }
    console.log("message is " + a);
    
    messageData.message = a;
    console.log("timestamp = " + timestamp);
  }

  for (let i = 0; i < data.services.length; i++) {
    if (data.services[i].name === address) {
      let l = data.services[i].messages.length;
      data.services[i].messages.push(messageData);
    }
  }
  console.log(data);
}


function displayService(serviceName, serviceStatus) {

   console.log(data);
  for (let i = 0; i < data.services.length; i++) {
    if (data.services[i].name === serviceName) {
      return;
    }
  }

  if (serviceName === "_o2" || serviceName === "_cs" || serviceName === "") {
    return;
  } else {
    data.services.push({
      name: serviceName,
      status: serviceStatus,
      selected: false,
      messages: [],
      localService: false
    });
  }
  
  generateOutput();
  console.log("displaying " + data);
}

if (viewServicesButton) {
  viewServicesButton.addEventListener("click", function () {
    console.log("starting discovery");
    o2ws_send("/_o2/ws/ls", 0, "");
  });
}

if (createServiceButton) {
  createServiceButton.addEventListener("click", function () {
    newservice = "";
    if (newServiceName.value != "") {
      newservice = newServiceName.value;
    }
    console.log("starting creating service: " + newservice);
    o2ws_method_new("/" + newservice, "s", false, handle_message, null);


    data.services.push({
      name: newservice,
      status: 6,
      selected: false,
      messages: [],
      localService: true
    });
    console.log(data);

    o2ws_set_services(newservice);
    o2ws_send("/_o2/ws/ls", 0, "");
    console.log(newservice);
    generateOutput();
  });
}

function setMessageType() {
  messageType = document.getElementById("messageType").value;
}

function sendMsg(e) {
  serviceName = e.id;
  const messageGet = document.getElementById("messageGet-" + serviceName);

  o2ws_send("/" + serviceName, 0, "s", messageGet.value); // sample message

  messageGet.value = "";
  console.log("message sent to " + serviceName);
}

function tap(e) {
   var tapper = "tap_" + e.id;
   o2ws_method_new("/" + tapper, "s", false, handle_message, null);
   o2ws_set_services(tapper);
   data.services.push({
      name: tapper,
      status: 6,
      selected: false,
      messages: [],
      localService: true
   });


   var tappingString = "/" + e.id + ":/" + tapper + ":K" // "K" for TAP_KEEP, "R" for TAP_RELIABLE, or "B" for TAP_BEST_EFFORT 
   o2ws_tap(tappingString);
   generateOutput();
   console.log(tappingString);
}

function showMessages(e) {
   serviceNameMsgs = e.innerText.toString();
   selectedService = serviceNameMsgs.trim();
   console.log("show msgs called " + selectedService);
   for (let i = 0; i < data.services.length; i++) {
      if (data.services[i].name === selectedService) {
        data.services[i].selected = true;
      }
      else {
         data.services[i].selected = false;
      }
   }
    genModalOutput();
}


function generateOutput() {
  console.log("generateOut called");
  var template = Handlebars.compile(
    document.getElementById("hbsBody").innerHTML
  );
  htmlData = template(data);
  document.getElementById("output").innerHTML = htmlData;
}

document.onload = generateOutput();


function genModalOutput() {
   console.log("generateOutModal called");
   var template = Handlebars.compile(
      document.getElementById("hbsModal").innerHTML
    );
    htmlData = template(data);
    document.getElementById("modalOutput").innerHTML = htmlData;
}