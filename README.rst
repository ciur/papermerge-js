Papermerge-js
==============

Frontend (js, scss, images, fonts, icons) project for PapermergeDMS.


Requirements
================

This project depends on `nodejs <https://nodejs.org/en/>`_ and `npm <https://github.com/npm/cli>`_.


1. Make sure you have `node.js <https://nodejs.org/en/> `_ installed. On Ubuntu Linux::

	sudo apt install nodejs npm

2. Run::

    npm install 

Above command will install npm dependecies.

Usage
=======

Watch current project (i.e. rebuid in development mode everytime a file changes)::

    npm run watch


Build static files for development mode (i.e debug version)::

    npm run dev

Build static files for production (i.e. minified version)::

    npm run prod