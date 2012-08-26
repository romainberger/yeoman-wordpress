# Yeoman Wordpress Generator

  Generator to use Yeoman on a Wordpress project.

## Installation

  *(coming soon)*

## Documentation

### Init

  `$ yeoman init wordpress` - Generates a new Wordpress project and the files needed to use Yeoman

### Server

  `$ yeoman server` - Since wordpress is a php framework, the yeoman server task can't be use directly. Here is how you can use it (thanks to @mklabs https://github.com/yeoman/yeoman/issues/250#issuecomment-8024212):

* 1. Start the yeoman server: `yeoman server`. You can close the page it opened, you won't use it.
* 2. Go to the wordpress with the host you created in Mamp or whatever you are using
* 3. Activate the LiveReload extension by clicking its button in your browser.
* 4. You're good to go!