## Release Notes

Brainy Words 2000 Web Application

Version 1.0

**New Features**

- Added a welcome screen
- Added a street screen
  - Added ability to click and drag with mouse to scroll along street
  - Added 100s of clickable audio elements to the street
  - Added 33 storefront categories to enter from the street
- Added a category screen to view the subcategories or words contained within each category
- Added quizzes for the words in the categories and subcategories
- Added coins that are accumulated for correctly answering quiz questions
- Added a progress screen
  - Added statistics from the results of quizzes for the current browser session
  - Added the ability to send an email containing the user&#39;s progress statistics

**Bug Fixes (major issues encountered during development that were fixed)**

- Users would be taken back to the start of the street when exiting a storefront instead of being return to outside of that storefront
- Multiple audio files could be played at the same time if multiple words were clicked in quick succession
- Street screen was scaled too large to be properly viewed on mobile devices
- Street image file was too large to be downloaded over a network within a reasonable amount of time
- The number of coins earned during quizzes disappeared after exiting each quiz and did not persist throughout the whole game session
- The game was unable to load a subcategory that was contained within another subcategory

**Known Bugs**

- The Android version of Firefox is unable to properly load the entire street image. The portion of the street after storefront category 28 does not display properly.
- When a quiz question is answered correctly, if the audio for the word being quizzed has not finished playing, it will continue playing as the next quiz question is presented.

## Install Guide

Install Guide for Brainy Words 2000 Web Application

**Prerequisites**

- js and NPM must already be installed. When installing Node.js, NPM will automatically be installed as well.
- To download the latest version of Node.js see [https://nodejs.org/](https://nodejs.org/)
  - Both the LTS (Long Term Support) and Current versions of Node.js should be compatible with the application. However, it is generally recommended that the LTS version is used.

**Dependencies**

- From the command line run the command &quot;npm install&quot; from within the root directory of the application (the folder containing _package.json_).
  - This command will install all packages that are needed to run the Node.js application.
  - The packages that will be installed are:
    - ■■body-parser (v1.17.1)
      - [https://www.npmjs.com/package/body-parser/v/1.17.1](https://www.npmjs.com/package/body-parser/v/1.17.1)
    - ■■express (4.15.2)
      - [https://www.npmjs.com/package/express/v/4.15.2](https://www.npmjs.com/package/express/v/4.15.2)
    - ■■express-handlebars (v3.0.0)
      - [https://www.npmjs.com/package/express-handlebars/v/3.0.0](https://www.npmjs.com/package/express-handlebars/v/3.0.0)

**Download**

Download version 1.0 of the Brainy Words 2000 Web Application from [https://github.com/NoahBlume/brainyWords2000](https://github.com/NoahBlume/brainyWords2000)

**Build**

- No build is necessary for this app. The Node.js application can be run once the necessary packages are installed.

**Installation**

- Simply copy the application files from the GitHub link to wherever you wish to store them on your computer.

**Running Application**

- Launch the command line, navigate the root application directory containing _app.js_, and type this command: node app.js
- The application should now be accessible from the browser at this address: _localhost:3000_
- While the above command will allow you to start the application on your computer, the links provided in the web server setup tutorials below will give more detailed instructions on how to set up a server that will automatically start the application whenever the server boots up.

**Troubleshooting**

- If you installed Node.js and the application is not able to run, in your command line enter the command: node -v
  - This will tell you what version of Node.js you have installed.
  - If Node.js is not installed or the version number is different from the version you downloaded from the link above, try installing Node.js again.
- If you are having trouble installing the packages with the command &quot;npm install&quot;, in your command line enter the command: npm -v
  - This will tell you what version of NPM you have installed.
  - If NPM was not installed, or if it was installed but its version number is lower than v6.4.1, you should try reinstalling Node.js or try installing NPM using the commands listed on this page: [https://www.npmjs.com/get-npm](https://www.npmjs.com/get-npm)
- If you are having trouble using the command line, this guide should be a good introduction: [https://tutorial.djangogirls.org/en/intro\_to\_command\_line/](https://tutorial.djangogirls.org/en/intro_to_command_line/)
  - The most relevant sections are:
    - ■■Open the command-line interface [https://tutorial.djangogirls.org/en/intro\_to\_command\_line/#open-the-command-line-interface](https://tutorial.djangogirls.org/en/intro_to_command_line/#open-the-command-line-interface)
    - ■■Change current directory [https://tutorial.djangogirls.org/en/intro\_to\_command\_line/#change-current-directory](https://tutorial.djangogirls.org/en/intro_to_command_line/#change-current-directory)

Web Server Setup Tutorials

**First Tutorial:**

[https://medium.com/@nishankjaintdk/setting-up-a-node-js-app-on-a-linux-ami-on-an-aws-ec2-instance-with-nginx-59cbc1bcc68c](https://medium.com/@nishankjaintdk/setting-up-a-node-js-app-on-a-linux-ami-on-an-aws-ec2-instance-with-nginx-59cbc1bcc68c)

Different web hosting services may provide additional tools to ease the setup of a Node.js application, but this first tutorial is based on a simple AWS EC2 (Amazon Web Services Elastic Compute Cloud) instance running Linux. While parts of the tutorial may be specific to AWS, such as getting the ssh key and configuring the security settings, the majority of the steps generalize to any Linux machine.

The key difference between this tutorial and the steps in the install guide above is that this tutorial will show you how to configure Nginx and PM2. PM2 allows you to set the Node.js application to automatically run whenever the server starts up. Nginx allows you to route incoming traffic on specific ports to whichever application you want. Nginx can also be used for load-balancing, if you want to distribute the application traffic across multiple servers.

After completing this first tutorial, the website should be up and running on the server.

**Second Tutorial:**

[https://medium.com/@nishankjaintdk/serving-a-website-on-a-registered-domain-with-https-using-nginx-and-lets-encrypt-8d482e01a682](https://medium.com/@nishankjaintdk/serving-a-website-on-a-registered-domain-with-https-using-nginx-and-lets-encrypt-8d482e01a682)

This second tutorial shows how to obtain a domain name and an SSL certificate for the website. Again, this tutorial is based on an AWS EC2 instance, but should generalize to other Linux environments.

Once this second tutorial has been completed, your website should be accessible from your domain name of choice and should be secured via SSL.
