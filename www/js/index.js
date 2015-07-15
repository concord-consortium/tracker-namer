/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.deviceList = document.getElementById("deviceList");
        app.refreshButton = document.getElementById("refreshButton");
        app.updateNamesButton = document.getElementById("updateNames");
        app.logList = document.getElementById("logList");
        app.refreshDeviceList();

        app.refreshButton.addEventListener("click", app.refreshDeviceList);
        app.updateNamesButton.addEventListener("click", app.updateNames);
    },
    clearLog: function () {
        app.logList.innerHTML = ''; // empties the list
    },
    log: function (message) {
        var listItem = document.createElement('li');
        listItem.innerHTML = message;
        app.logList.appendChild(listItem);
        console.log(message);
    },
    refreshDeviceList: function() {

        app.deviceList.innerHTML = ''; // empties the list
        rfduino.discover(5, app.onDiscoverDevice, app.onError);
    },
    updateNames: function() {
        app.deviceIds = [];
        app.clearLog();
        rfduino.list(function(devices) {
          // should log to screen that we got list of devices
          app.log("got list of devices");
          devices.forEach(function(device) {
            app.deviceIds.push(device.uuid);
          });
          if(app.deviceIds.length == 0){
            // should log to screen that no devices found
            app.log("no devices found");
            return;
          }
          app.connectToNextDevice();
        }, app.onError);
    },
    connectToNextDevice: function() {
        if(app.deviceIds.length == 0){
            // no more devices to process
            app.log("finished, refreshing list");
            // give it a bit more time before refreshing
            setTimeout(app.refreshDeviceList, 800);
            return;
        }
        app.currentDeviceId = app.deviceIds.pop();
        rfduino.connect(app.currentDeviceId, function (){
          app.log("connected to: " + app.currentDeviceId);
          setTimeout(app.writeNameToDevice, 100);
        }, app.onError);
    },
    encodeString: function (string) {
        var array = new Uint8Array(string.length);
        for (var i=0, len=string.length; i<len; i++) {
          array[i] = string.charCodeAt(i);
        }
        return array.buffer;
    },
    writeNameToDevice: function(){
      app.log("updating: " + app.currentDeviceId);
      var customName = app.currentDeviceId.slice(-5);
      var command = "n" + customName;
      rfduino.write(app.encodeString(command), function (){
        setTimeout(app.disconnectAndContinue, 500);
      }, app.onError);
    },
    disconnectAndContinue: function () {
        app.log("disconnecting");
        rfduino.disconnect(function (){
          // give a little bit of time to disconnect
          setTimeout(app.connectToNextDevice, 100);
        }, app.onError);
    },
    onDiscoverDevice: function(device) {
        var listItem = document.createElement('li'),
            html = '<b>Name: ' + device.name + '</b> Data: ' + device.advertising + '<br/>' +
                device.uuid;
        listItem.setAttribute('uuid', device.uuid);
        listItem.innerHTML = html;
        app.deviceList.appendChild(listItem);
    },
    onError: function(error) {
        app.log("ERR: " + error);
    }
};

app.initialize();