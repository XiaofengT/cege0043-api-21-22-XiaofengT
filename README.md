# Asset Managing App

A technical guide of assets managing app for both browser-based and mobile-based. This app helps the user to create and manage their assets based on the locations, add it to a database on the web server. On the browser, you can manually click a location on the map and enter the asset name and installation date of the location to create an asset. On the mobile terminal, users can click the created asset point to change its condition information and upload it to the database. The application on mobile terminal can also track the real-time location of the user and pop up the condition form nearest to the user's current location for filling. In addition, the application can also load the 5 assets closest to the user according to the user's location; The location to load the five most recently submitted condition information; And the locations of all assets that were not rated within 3 days of loading.Users can also remove these layers.

## Table of Contents

1. System Requirements


## 1. System Requirements

* In order to enable the full functionality of this app, a browser that supports geolocation access via http connection is required. Some browsers (such as Safari) block geolocation access via http connection. As a result, the app cannot locate and zoom into user positions if it is opened in those browsers. Therefore, it is recommended to use Chrome(Version 73.0.3683.75 or above) or Firefox(Version 65.0.2 or above) for this app.
* This app requires to make connections to a Ubuntu Server (Virtual Machine). You could use BitVise, Pycharm (Version 2018.3.5 Professional Edition) or other SSH software to connect to the Ubuntu Server.
* If you are going to use this app outside the UCL campus (not connected to Eduroam), make sure you are connected to UCL VPN by following the instructions at https://www.ucl.ac.uk/isd/services/get-connected/remote-working-services/ucl-virtualprivate-network-vpn.

## 2. Deployment

* Procedures to deploy this app:
1. Clone the source code of this question setting app from Github to CEGE server at `home/studentuser/code` by typing in the command line (terminal) window for Ubuntu:
`cd /home/studentuser/code`
`git clone https://github.com/ucl-geospatial-21-22/cege0043-api-21-22-XiaofengT.git`
`git clone https://github.com/ucl-geospatial-21-22/cege0043-apps-21-22-XiaofengT.git`
3. Go to the uceslxw-server folder and start the Node JS server.
`cd /home/studentuser/code/cege0043-api-21-22-XiaofengT`
`pm2 start dataAPI.js`
`cd /home/studentuser/code/cege0043-apps-21-22-XiaofengT`
`pm2 start app.js`
4. Make sure the Node JS server is successfully started. If any error occurs, you could enter the debug mode through the command line window by typing
`cd /home/studentuser/code/cege0043-api-21-22-XiaofengT`
`node dataAPI.js`

## 3. Testing

* Procedures to test this app:
1. Make sure your device is connected to UCL Wifi or UCL VPN.
2. Make sure the Node JS server is active.
3. In a browser that supports geolocation access via http connection (such as Chromeor Firefox), type the following address to use the question setting app. https://cege0043-2022-15.cs.ucl.ac.uk/app/bootStrap.html
4. While testing the functionality of this map, use of Inspect or Developer mode of the browser to see if any error occurs.

## 4. File description

The files associated this asset managing app are located in the cege0043-api-21-22-XiaofengT
