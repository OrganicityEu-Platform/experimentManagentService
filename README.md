# Experimennt Management Service

This is the backend for managing experiments, as well as the applications belonging to the experiments, assets created by it and those used by the experiment.

The service consists of a `node`server and `mongo` data base.

## Prerequisites

You need git to clone the repository. You can get git in [http://git-scm.com/](http://git-scm.com/), or from the software service of your OS.

You must have a mongo data base instance installed. You can get mongoDB in [https://www.mongodb.com/](https://www.mongodb.com/), or from the software service of your OS.

You must have node.js and its package manager (npm) installed. You can get them from [http://nodejs.org/](http://nodejs.org/), or from the software service of your OS.



## Clone the project

Clone the repository using:

```
git clone https://github.com/OrganicityEu/experimentManagentService.git
```

## Dependencies
* Install dependencies of the project: `npm install.`

## Logs
* Logging information is stores in `logs` folder. The system creates a daily file with maximum size of 5MB.

## Gulp tasks

* `gulp serve` to build and launch the service. It will keep watching the service files to provide code information (for developing). Full logging.
* `gulp deploy` to build and launch the service. Watching process is omitted. There is hardly any difference since the deploy version does not uglify nor concatenate files. Error and warn logging.
* `gulp clean` to clean the installation, including dependencies and logs

## TODO
* Applcation compatibility with SmartphoneExperimentation
    1. On Creation: if application type is "SmartphoneExperimentation", create a SmartphoneExperimentation "experiment" with the common information and the dedicated one.
    2 On Retrieving: if application is "SmartphoneExperimentation", get additional information from the SmartphoneExperimentation "experiment"
    3. On deletion: if application is "SmartphoneExperimentation", remove also SmartphoneExperimentation "experiment"
* Integrate asset selection