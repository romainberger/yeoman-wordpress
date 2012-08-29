# Yeoman Wordpress Generator

  Generator to use Yeoman on a Wordpress project.

## Installation

  *(To update after the release of Yeoman)*

  Go to the directory where you have cloned Yeoman. `cd` to `cli/lib/generators/` and clone this repo. Once it's done, you can rename the directory to 'wordpress' to make the command a bit shorter (if you keep the name 'yeoman-wordpress' the init task will be `yeoman init yeoman-wordpress`)

## Documentation

### Init

  `$ yeoman init wordpress` - Generates a new Wordpress project with a fresh html5boilerplate theme and the files needed to use Yeoman.

### Server

  `$ yeoman server` - Since wordpress is a php framework, the yeoman server task can't be use directly. Here is how you can use it (thanks to @mklabs https://github.com/yeoman/yeoman/issues/250#issuecomment-8024212):

* 1. Start the yeoman server: `yeoman server`. You can close the page it opened, you won't use it.
* 2. Go to the wordpress with the host you created in Mamp or whatever you are using
* 3. Activate the LiveReload extension by clicking its button in your browser.
* 4. You're good to go!

### Build

  `$ yeoman build` - *Not 100% working for now (missing: js concatenation)*