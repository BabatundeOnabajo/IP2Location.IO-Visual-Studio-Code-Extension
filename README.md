# IP2Location.IO-Visual-Studio-Code-Extension
This is an extension for the popular Integrated Development Environment (IDE) Visual Studio Code. With this extension, you can obtain information about a given IP address within Visual Studio Code, either within the Command Palette or by right-clicking an IP address that appears within a given file. This program was "vibe coded" with Claude Opus 4.

# Overview
One thing I have always wanted to develop was a VS Code extension. I've also always wanted the convenience of getting information about a given IP address within VS Code, and so I decided to create this extension! 

# Requirements
You need the following to run this program:

1. Visual Studio Code. You can download it here: https://code.visualstudio.com/ 
2. API key from IP2Location.IO. You can download it here: https://www.ip2location.io/
3. Node.js installed. You can download it for your system here: https://nodejs.org/en/download
4. npm installed. You can download it for your system here: https://nodejs.org/en/download

# Instructions - Current as of September 29th 2025 (future updates may affect the instructions below)
In order to test this extension, please follow the instructions below after you have complied with the Requirements above..

1. If you are using a Windows or Mac or Linux device, please open VS Code. Ordinarily, you can do this with the single line of code:
`code`
However, this might not work on Mac in some situations, in which case please open the software manually and refer to [1] in the Troubleshooting section.
2. Open Terminal on Mac (or its equivalent in Linux systems) or Command Prompt on Windows.
3. Type the following code: `npm install -g yo generator-code`
4. Type the following code: `yo code`.
5. You will be presented with a number of options, like the screenshot below:
![Screenshot](https://github.com/BabatundeOnabajo/IP2Location.IO-Visual-Studio-Code-Extension/blob/main/Screenshot%202025-09-29%20at%2019.08.59.png)
6. Choose: New Extension (Typescript).
7. You are free to name the extension what you want but for consistency in order to follow these instructions, enter: IP2Location Lookup.
8. You are free to choose the identifier you want for the extension but for consistency, enter: ip2location-io-lookup
9. You are free to enter a description you feel is appropriate for the extension, but for consistency type: This enables users to lookup 
information relating to a given IP address.
10. Choose: Yes.
11. Choose: unbundled.
12. Choose npm.

This will create the foundations of your VS Code extension. However, there is still work to do. Typically, VS Code will launch once installation has completed.

12. In your VS Code, you should see a file called "package.json". Open that file and then come back to this Github. Copy the code from the file in *this* Github repository called [package.json](https://github.com/BabatundeOnabajo/IP2Location.IO-Visual-Studio-Code-Extension/blob/main/package.json) and overwrite the content in your VS Code in the package.json file.
13. In your VS Code, you should see a file called "extension.ts". Open that file and then come back to this Github. Copy the code from the file in *this* Github repository called [extension.ts](https://github.com/BabatundeOnabajo/IP2Location.IO-Visual-Studio-Code-Extension/blob/main/extension.ts) and overwrite the content in your VS Code in the extension.ts file.
14. To test out the extension, press F5 if you are on Windows or alternatively press "Run" if you are on a Mac or Linux device.
15. Once you have done those two steps, your VS Code is complete. Unbelievable, right!?

# Preview
With the VS Code extension, you can now obtain information about a particular IP address. You can do this in the Command Palette, or alternatively, if there is an IP address in the code itself, you can simply right-click the IP address and press "Lookup Selected IP" (see screenshot below). You may be requested to set your API key. You can do this by copying the API key from your IP2Location.IO dashboard. 

# Troubleshooting
[1] On Mac, ordinarily, you can open VS Code by simply typing `code` in Terminal. However, this is not always possible. To resolve this, you can type the following in the Command Palette within VS Code: `Shell Command: Install 'code' command in PATH` . After this, when you type `code` in Terminal, it should automatically open VS Code.
[2] Always keep your API key secure. To the best of my knowledge and belief, there are no security implications with this extension.

# Useful resources
[1] IPVoid: https://www.ipvoid.com/random-ip/ (You can generate random IP addresses if you do not want to test a particular IP address).

# Screenshots
![Screenshot](https://github.com/BabatundeOnabajo/IP2Location.IO-Visual-Studio-Code-Extension/blob/main/Screenshot%202025-09-29%20at%2018.39.13.png)
![Screenshot](https://github.com/BabatundeOnabajo/IP2Location.IO-Visual-Studio-Code-Extension/blob/main/Screenshot%202025-09-29%20at%2018.39.34.png)
![Screenshot](https://github.com/BabatundeOnabajo/IP2Location.IO-Visual-Studio-Code-Extension/blob/main/Screenshot%202025-09-29%20at%2018.40.20%201.png)
![Screenshot](https://github.com/BabatundeOnabajo/IP2Location.IO-Visual-Studio-Code-Extension/blob/main/Screenshot%202025-09-29%20at%2018.40.20.png)
