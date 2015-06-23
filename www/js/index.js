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
        app.refreshDeviceList();

        app.refreshButton.addEventListener("click", app.refreshDeviceList);
        app.updateNamesButton.addEventListener("click", app.updateNames);
    },
    refreshDeviceList: function() {

        app.deviceList.innerHTML = ''; // empties the list
        rfduino.discover(5, app.onDiscoverDevice, app.onError);
    },
    updateNames: function() {
        app.deviceIds = [];
        rfduino.list(function(devices) {
          devices.forEach(function(device) {
            app.deviceIds.push(device.uuid);
          });
          app.updateNames2();
        }, app.onError);
    },
    updateNames2: function() {
        if(app.deviceIds.length == 0){
            return
        }
        app.currentDeviceId = app.deviceIds.pop();
        rfduino.connect(app.currentDeviceId, function (){
          encoder = new TextEncoder("utf-8");
          var customName = app.currentDeviceId.slice(-5);
          var command = "n" + customName;
          rfduino.write(encoder.encode(command).buffer, function (){
            rfduino.disconnect(function (){
              app.updateNames2();
            }, app.onError);
          }, app.onError);
        }, app.onError);
    },
    onDiscoverDevice: function(device) {
        var listItem = document.createElement('li'),
            html = '<b>' + device.name + '</b><br/>' +
                device.uuid;
        listItem.setAttribute('uuid', device.uuid);
        listItem.innerHTML = html;
        app.deviceList.appendChild(listItem);
    },
    onError: function(error) {
        console.log(error);
    }
};

app.initialize();