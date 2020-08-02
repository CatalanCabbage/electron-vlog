<p align="center">
 <img alt="Electron vLog" src="assets/vlogLogo.png" height="150"></img>
</p>

<p align="center">
 <a href="https://github.com/CatalanCabbage/electron-vlog-experiments"><img alt="Tests repo" src="https://img.shields.io/badge/tests_repo-electron--vlog--experiments-9b94ff"></a>
 <a href="https://github.com/CatalanCabbage/electron-vlog"><img alt="GitHub license" src="https://img.shields.io/github/license/CatalanCabbage/electron-vlog?color=55b4ce"></a>
</p>

<p align="center">
 <b>The zero-effort way to take video recordings, screenshots and timelapse images of your Electron app. </b> <br>
 Requires just two words of code: <code>require('electron-vlog')</code> <br>
 That's it. Swear by mine beard.<sup id="a1"><a href="README.md#footnotes">*</sup>
</p>

### What is Electron vLog?
A light-weight, zero-dependency package that *(spoiler alert)* visually logs your work!
* **Take videos** of your Electron app - want to put together a quick demo? Or make it easier for users to share videos of your app?
* **Take perfect screenshots** of your app window natively without having to edit and snip and crop   
* **Make a time-lapse** to visually document your app's journey from start to finish. See how your UI evolved from a plain window to a glorious app!  
(*How does this work?* Automatically take screenshots of your app at regular intervals; you can stitch them all together in the end to get a video, which makes for a great journey story to look back on your hard work!)

### Examples
### How do you use it?
### Options


-----
Content
# [WIP]electron-vlog
 Take video recordings, screenshots and time-lapses of your Electron app with ease

### Objectives:
- [ ] Port as npm package
- [ ] Must work for multiple windows, with simple instructions
- Zero-effort
    - [ ] Video recording
    - [ ] Screenshots
    - [ ] Timelapses
- Comprehensive options
    - [ ] Path to save media
    - [ ] Media naming format
    - [ ] Debug option
    - [ ] Callback on image save - even prevent save
    - Timelapse
        - [ ] Time interval between screenshots 
    - Screenshots
        - [ ] Window vs visible area
- [ ] Self-explanatory debug logging option
- [ ] Have tests for all cases

### To-do:
- [x] Create a separate repo for testing *-[electron-vlog-experiments](https://github.com/CatalanCabbage/electron-vlog-experiments)*
- [x] Simulate npm package locally
- [ ] Write tests!


### Installing the package:
```shell script
npm install --save electron-vlog
```

### Usage:
`require` the `electron-vlog` module in any HTML page
````javascript
const vlog = require('electron-vlog');
````  

*That's all the code you need! Now use keyboard shortcuts to perform actions:*  
<br>
**Screenshot**:  
Use the shortcut `Crtl+Shift+M` to capture a screenshot  

**Timelapse**:  
`Crtl+Shift+B` to start taking timelapse screenshots, `Crtl+Shift+B` again to stop

**Record screen**:  
`Crtl+Shift+N` to start recording screen, `Crtl+Shift+N` again to stop

-----

### Upcoming changes:  
* Add automated testing
* More options:
    * Absolute path to save media
    * Media naming format
    * Callback on image save
    
##### Footnotes:  
<b id="f1">1</b> `Swear by mine beard`, paraphrased from the Bard - Shakespeare's *As you like it*, [Act I Scene II](https://www.opensourceshakespeare.org/views/plays/play_view.php?WorkID=asyoulikeit&Act=1&Scene=2&Scope=scene&LineHighlight=204#204). [↩](#a1)
