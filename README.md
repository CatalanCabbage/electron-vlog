[badges]
# electron-vlog [logo]
[tiny gist]
### ToC
### What is it? Context.
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
    
