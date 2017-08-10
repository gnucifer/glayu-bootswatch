# Glayu Bootswatch

A theme builder for [Glayu](https://github.com/pmartinezalvarez/glayu) static site generator.

[Demo](http://glayu-bootswatch-demo.dagu.nu) using the "Sandstone" Bootswatch theme.

This is not a ready to use Glayu theme, but a [Gulp](https://gulpjs.com) based Glayu theme build script. It can be used to build a theme based on [Bootstrap](http://getbootstrap.com), [Bootswatch](https://bootswatch.com), [Font Awesome](http://fontawesome.io) and [Google Web Fonts](https://fonts.google.com). This theme can be used as is, but this project can also be used as a starting point for a new custom theme.

## Quick start

Clone the repo, and install dependencies with `npm install` and `bower install`. Copy config.example.json to config.json. Unless you want to run any of the `glayu-*` gulp tasks it can be left as is. `gulp build` will build the theme to the `./dist` directory. This theme can either be copied in manually to the Glayu `themes` directory If the config option `glayu.root` and `glayu.theme` are set, `gulp serve`, `gulp glayu-build` or `gulp glayu-watch` will automatically sync the theme when the theme files are changed.

## Features

- Use `gulp serve` for [Browser Sync](https://www.browsersync.io) to provide a synchronized version of the Glayu site in the broswer. No need to manually run `gulp build` and `glayu build` to propagate changes during theme development.

- Automatic generation of primary navigation links when creating new Glayu pages and posts. The default behavior might not fit everyone, but can be tweaked or replaced with something else.

- Preconfigured to use [SASS](http://sass-lang.com) for styling.

- jQuery, Bootstrap, Bootswatch and Font Awesome included.
