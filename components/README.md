# How to use our new and improved component system

Implement all aframe components or classes in separate javascript files under modules.

Each Component should export a load function that initializes it or performs nessecary actions for it.

If components can be nested, i.e. are dependent on each other and only on each other, then you should create a subfolder with a higher order component name and create a main.js file which manages all initialisation or code.

To use in any vrlandio world, run `rollup main.js --file "../packaged-$(basename "$(pwd)")"`