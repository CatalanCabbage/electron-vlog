> _WIP: Not release ready. Tested to work, but options have not been added yet._

<p align="center">
 <img alt="Electron vLog" src="assets/vlogLogo.png" height="150"></img>
</p>

<p align="center">
 <a href="https://github.com/CatalanCabbage/electron-vlog-experiments"><img alt="Tests repo" src="https://img.shields.io/badge/tests_repo-electron--vlog--experiments-9b94ff"></a>
 <a href="https://github.com/CatalanCabbage/electron-vlog"><img alt="GitHub license" src="https://img.shields.io/github/license/CatalanCabbage/electron-vlog?color=55b4ce"></a>
</p>

-----

<p align="center">
 <b>The zero-effort way to take video recordings, screenshots and timelapse images of your Electron app. </b> <br>
 Requires just two words of code: <code>require('electron-vlog')</code> <br>
 That's it. Swear by mine beard.<sup id="a1"><a href="README.md#footnotes">*</sup>
</p>

-----

## What is Electron vLog?
A light-weight, zero-dependency package that *(spoiler alert)* visually logs your work!
* **Take videos** of your Electron app - want to put together a quick demo? Or make it easier for users to share videos of your app?
* **Take perfect screenshots** of your app window natively without having to edit and snip and crop   
* **Make a time-lapse** to visually document your app's journey from start to finish. See how your UI evolved from a plain window to a glorious app!  
(*How does this work?* Automatically take screenshots of your app at regular intervals; you can stitch them all together in the end to get a great video of your app's journey!)

## Examples

## Installing the package:
```shell script
npm install --save electron-vlog
```
or if you want to use this package only during development:
```shell script
npm install --save-dev electron-vlog
```
## Code setup:

`require` the `electron-vlog` module in *any* Javascript file that has been included in the HTML page you want to record.

For example, if `index.js` is included in the `index.html` that you want to capture/record, like this:
```html
...
<script src="./index.js"></script>
...
```
then add this one line to your `index.js` file:
````javascript
require('electron-vlog');
````  

*That's all the code you need!*  

## Usage:
You can now use **keyboard shortcuts** to perform actions.  
*(Note: You can customize behavior, as detailed in the options section.)*
### `Crtl+Shift+M` Captures a screenshot 
Captures an image of the window in focus while pressing the shortcut.

### `Crtl+Shift+B` - Toggles Timelapse 
First press starts timelapse, second press stops timelapse.  
Takes a screenshot every few seconds - only if there's a change in appearance.  
That is, the screenshot is saved only if it differs from the previous screenshot, so that you don't end up with the same images! 

### `Crtl+Shift+N` - Toggles Screen Recording  
First press starts recording, second press stops recording.

## Programmatic usage(API):
Basic API's have been exposed to perform these actions with code. 

### Options
_To be added_

-----

-----
**Rough draft**
# [WIP]electron-vlog

### Objectives:
- [ ] Port as npm package
- [x] Must work for multiple windows, with simple instructions
- Zero-effort
    - [x] Video recording
    - [x] Screenshots
    - [x] Timelapses
- Comprehensive options
    - [x] Path to save media
    - [ ] Media naming format
    - [x] Debug option
    - [ ] Callback on image save - even prevent save
    - Timelapse
        - [x] Time interval between screenshots 
    - Screenshots
        - [x] Window vs visible area
- [x] Self-explanatory debug logging option
- [ ] Have tests for all cases

### To-do:
- [x] Create a separate repo for testing *-[electron-vlog-experiments](https://github.com/CatalanCabbage/electron-vlog-experiments)*
- [x] Simulate npm package locally
- [ ] Write tests

### Upcoming changes:  
* Add automated testing
* More options:
    * Absolute path to save media
    * Media naming format
    * Callback on image save
    
-----
##### Footnotes:  
<b id="f1">1</b> `Swear by mine beard`, paraphrased from the Bard - Shakespeare's *As you like it*, [Act I Scene II](https://www.opensourceshakespeare.org/views/plays/play_view.php?WorkID=asyoulikeit&Act=1&Scene=2&Scope=scene&LineHighlight=204#204). [↩](#a1)
