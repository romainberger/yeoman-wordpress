# Yeoman Wordpress Generator

  Generator to use Yeoman on a Wordpress project.

  For more informations about Yeoman, see [Yeoman.io](http://yeoman.io/)

## Installation (for Yeoman >= 0.9.3)

  Here is a way to install globally the generator, which means you will be able to use it everywhere (this works on a Mac, I have no idea how this works on Linux or Windows).
  You may need to follow this procedure every time you update Yeoman.

* `$ cd /usr/local/lib/node_modules/yeoman/node_modules/yeoman-generators/lib/generators`
* `$ git clone git://github.com/romainberger/yeoman-wordpress.git` (you may need to run this with `sudo`)

#### Uninstalling

  Here is how to uninstall the generator

  * `$ cd /usr/local/lib/node_modules/yeoman/node_modules/yeoman-generators/lib/generators`
  * `$ rm -rf yeoman-wordpress/`


## Documentation

### Init

  `$ yeoman init yeoman-wordpress` - Generates a new Wordpress project with a starter theme and the files needed to use Yeoman. Once Yeoman is done, install your new wordpress project, and activate the theme in the admin panel.

  Yeoman will ask you which version of Wordpress you want to use (latest stable version by default), the starter theme and a few informations to make the theme ready be to used. Most of the defaults informations can be changed in the [config file](#configuration).

### Server

  `$ yeoman server` - Since wordpress is a php framework, the yeoman server task can't be use directly. Here is how you can use it ([thanks to @mklabs](https://github.com/yeoman/yeoman/issues/250#issuecomment-8024212)):

* Start the yeoman server: `$ yeoman server`. You can close the page it opened, you won't use it.
* Go to the wordpress with the host you created in Mamp or whatever you are using
* Activate the LiveReload extension by clicking its button in your browser.

### Build

  `$ yeoman build` - Build an optimized version of your app, ready to deploy *(Still needs some work)*

## Configuration

  Yeoman-wordpress stores some defaults values so you won't have to type the same things every time you start a project. The first time you will use the generator it will create a config file with the informations you gave. These informations will be used as default values so you can override them during the init task. If you want to change the default values you can do it by editing the config file located in `~/.yeoman/yeoman-wordpress/config.json`.